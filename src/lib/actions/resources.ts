"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import {
  bool,
  nullableString,
  pickEnum,
  safeFileName,
} from "@/lib/forms";
import { canAccessCourseContent, isCourseInstructor } from "@/lib/data/enrolments";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { createSignedDownloadUrl } from "@/lib/storage/signed-url";
import { uploadFile } from "@/lib/storage/upload";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert } from "@/types";

export type ResourceUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export type ResourceActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const VALID_RESOURCE_TYPES: Enums<"resource_type">[] = [
  "pdf",
  "doc",
  "sheet",
  "slide",
  "zip",
  "link",
  "template",
  "image",
  "video",
  "other",
];

export async function getResourceDownloadUrl(
  resourceId: string,
): Promise<ResourceUrlResult> {
  const supabase = await createClient();

  const { data: resource } = await supabase
    .from("resources")
    .select(
      "id, course_id, lesson_id, module_id, storage_bucket, storage_path, public_url, external_url, is_public, file_name, is_downloadable",
    )
    .eq("id", resourceId)
    .maybeSingle();

  if (!resource) return { ok: false, error: "Resource not found." };

  if (!resource.is_public) {
    const user = await requireUser();
    const courseId = await resolveCourseIdForResource(resource);
    if (!courseId) {
      return { ok: false, error: "Resource has no course context." };
    }
    const ok = await canAccessCourseContent(user.id, courseId);
    if (!ok) {
      return { ok: false, error: "You don't have access to this resource." };
    }
  }

  if (resource.external_url) return { ok: true, url: resource.external_url };
  if (resource.public_url) return { ok: true, url: resource.public_url };

  if (!resource.storage_bucket || !resource.storage_path) {
    return { ok: false, error: "Resource has no downloadable file." };
  }

  const url = await createSignedDownloadUrl(
    resource.storage_bucket,
    resource.storage_path,
    300,
    resource.is_downloadable
      ? { downloadAs: resource.file_name ?? undefined }
      : undefined,
  );

  if (!url) return { ok: false, error: "Could not generate download URL." };
  return { ok: true, url };
}

async function resolveCourseIdForResource(resource: {
  course_id: string | null;
  lesson_id: string | null;
  module_id: string | null;
}): Promise<string | null> {
  if (resource.course_id) return resource.course_id;
  const supabase = await createClient();

  if (resource.lesson_id) {
    const { data } = await supabase
      .from("lessons")
      .select("course_id")
      .eq("id", resource.lesson_id)
      .maybeSingle();
    if (data?.course_id) return data.course_id;
  }

  if (resource.module_id) {
    const { data } = await supabase
      .from("course_modules")
      .select("course_id")
      .eq("id", resource.module_id)
      .maybeSingle();
    if (data?.course_id) return data.course_id;
  }

  return null;
}

export async function createResourceAction(
  _prev: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  const inputCourseId = nullableString(formData.get("course_id"));
  const lessonId = nullableString(formData.get("lesson_id"));
  const moduleId = nullableString(formData.get("module_id"));

  if (!inputCourseId && !lessonId && !moduleId) {
    return {
      status: "error",
      message: "Attach the resource to a course, module or lesson.",
    };
  }

  const user = await requireUser();

  // Always normalise to a courseId for permission checks AND to satisfy the
  // existing resources RLS policy which only matches on course_id.
  const courseId = await resolveCourseIdForResource({
    course_id: inputCourseId,
    lesson_id: lessonId,
    module_id: moduleId,
  });
  if (!courseId) {
    return { status: "error", message: "Could not determine course context." };
  }

  const canManage =
    (await isCourseInstructor(user.id, courseId)) || (await isAdmin(user.id));
  if (!canManage) {
    return { status: "error", message: "You can't add resources to this course." };
  }

  const title = nullableString(formData.get("title"));
  const resourceType = pickEnum(
    formData.get("resource_type"),
    VALID_RESOURCE_TYPES,
    "other",
  );
  const externalUrl = nullableString(formData.get("external_url"));
  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;

  if (!title) {
    return { status: "error", message: "Title is required." };
  }
  if (!externalUrl && !hasFile) {
    return {
      status: "error",
      message: "Upload a file or provide an external URL.",
    };
  }

  let storage_bucket: string | null = null;
  let storage_path: string | null = null;
  let file_name: string | null = null;
  let mime_type: string | null = null;
  let file_size_bytes: number | null = null;

  if (hasFile) {
    const safeName = safeFileName(file.name);
    const path = `${courseId}/${Date.now()}_${safeName}`;
    const result = await uploadFile(
      STORAGE_BUCKETS.LESSON_RESOURCES,
      path,
      file,
    );
    if (!result.ok) {
      return { status: "error", message: `Upload failed: ${result.error}` };
    }
    storage_bucket = STORAGE_BUCKETS.LESSON_RESOURCES;
    storage_path = result.path;
    file_name = file.name;
    mime_type = file.type || null;
    file_size_bytes = file.size;
  }

  const insert: TablesInsert<"resources"> = {
    course_id: courseId,
    lesson_id: lessonId,
    module_id: moduleId,
    title,
    description: nullableString(formData.get("description")),
    resource_type: resourceType,
    storage_bucket,
    storage_path,
    external_url: externalUrl,
    file_name,
    mime_type,
    file_size_bytes,
    is_downloadable: bool(formData.get("is_downloadable")),
    is_public: bool(formData.get("is_public")),
    created_by: user.id,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("resources").insert(insert);
  if (error) return { status: "error", message: error.message };

  if (lessonId) {
    revalidatePath(`/instructor/courses/${courseId}/lessons/${lessonId}`);
    revalidatePath(`/dashboard/courses/${courseId}/lessons/${lessonId}`);
  }
  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath(`/dashboard/courses/${courseId}`, "layout");

  return { status: "success", message: "Resource added." };
}

export async function deleteResourceAction(
  resourceId: string,
): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: resource } = await supabase
    .from("resources")
    .select("course_id, lesson_id, module_id, storage_bucket, storage_path")
    .eq("id", resourceId)
    .maybeSingle();

  if (!resource) return;

  const courseId = await resolveCourseIdForResource(resource);
  if (!courseId) return;

  const canManage =
    (await isCourseInstructor(user.id, courseId)) || (await isAdmin(user.id));
  if (!canManage) return;

  await supabase.from("resources").delete().eq("id", resourceId);

  // Best-effort: try to remove the storage object too. Not awaited via try/catch
  // because Supabase Storage may already be inconsistent if RLS blocks delete.
  if (resource.storage_bucket && resource.storage_path) {
    await supabase.storage
      .from(resource.storage_bucket)
      .remove([resource.storage_path])
      .catch(() => undefined);
  }

  if (resource.lesson_id) {
    revalidatePath(
      `/instructor/courses/${courseId}/lessons/${resource.lesson_id}`,
    );
    revalidatePath(
      `/dashboard/courses/${courseId}/lessons/${resource.lesson_id}`,
    );
  }
  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath(`/dashboard/courses/${courseId}`, "layout");
}
