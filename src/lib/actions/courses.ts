"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin, requireInstructor } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";
import { safeFileName } from "@/lib/forms";
import { isCourseInstructor } from "@/lib/data/enrolments";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { getPublicUrl, uploadFile } from "@/lib/storage/upload";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert, TablesUpdate } from "@/types";

async function uploadCourseImage(
  courseId: string,
  file: File,
): Promise<string | null> {
  const safeName = safeFileName(file.name);
  const path = `${courseId}/${Date.now()}_${safeName}`;
  const result = await uploadFile(
    STORAGE_BUCKETS.COURSE_IMAGES,
    path,
    file,
    { upsert: true },
  );
  if (!result.ok) return null;
  return getPublicUrl(STORAGE_BUCKETS.COURSE_IMAGES, result.path);
}

export type CourseFieldErrors = Partial<Record<"title" | "slug", string>>;

export type CourseActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: CourseFieldErrors };

function nullableString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true";
}

function nullableNumber(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const VALID_DELIVERY: Enums<"course_delivery_type">[] = [
  "self_paced",
  "cohort",
  "hybrid",
];

function pickDelivery(v: FormDataEntryValue | null): Enums<"course_delivery_type"> {
  return VALID_DELIVERY.includes(v as Enums<"course_delivery_type">)
    ? (v as Enums<"course_delivery_type">)
    : "self_paced";
}

async function assertCanEditCourse(userId: string, courseId: string) {
  const ok =
    (await isCourseInstructor(userId, courseId)) || (await isAdmin(userId));
  if (!ok) throw new Error("You don't have permission to edit this course.");
}

export async function createCourseAction(
  _prev: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  const user = await requireUser();
  await requireInstructor(user.id);

  const title = nullableString(formData.get("title"));
  const slugInput = nullableString(formData.get("slug"));
  const slug = slugInput ?? (title ? slugify(title) : null);

  const fieldErrors: CourseFieldErrors = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!slug) fieldErrors.slug = "Slug is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const insert: TablesInsert<"courses"> = {
    title: title!,
    slug: slug!,
    instructor_user_id: user.id,
    created_by: user.id,
    visibility: "draft",
    delivery_type: pickDelivery(formData.get("delivery_type")),
    subtitle: nullableString(formData.get("subtitle")),
  };

  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Slug already exists.",
        fieldErrors: { slug: "Already used by another course." },
      };
    }
    return { status: "error", message: error.message };
  }

  await supabase.from("course_instructors").upsert(
    { course_id: course.id, user_id: user.id, is_primary: true },
    { onConflict: "course_id,user_id" },
  );

  revalidatePath("/instructor/courses");
  redirect(`/instructor/courses/${course.id}`);
}

export async function updateCourseAction(
  _prev: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  const courseId = nullableString(formData.get("course_id"));
  if (!courseId) return { status: "error", message: "Missing course id." };

  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  let thumbnailUrl = nullableString(formData.get("thumbnail_url"));
  const thumbnailFile = formData.get("thumbnail_file");
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    const uploaded = await uploadCourseImage(courseId, thumbnailFile);
    if (!uploaded) {
      return { status: "error", message: "Thumbnail upload failed." };
    }
    thumbnailUrl = uploaded;
  }

  let featuredUrl = nullableString(formData.get("featured_image_url"));
  const featuredFile = formData.get("featured_image_file");
  if (featuredFile instanceof File && featuredFile.size > 0) {
    const uploaded = await uploadCourseImage(courseId, featuredFile);
    if (!uploaded) {
      return { status: "error", message: "Featured image upload failed." };
    }
    featuredUrl = uploaded;
  }

  // TagsInput emits one hidden `<input name="tag">` per chip; collect + dedupe.
  const tags = [
    ...new Set(
      formData
        .getAll("tag")
        .filter((v): v is string => typeof v === "string")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ];

  const update: TablesUpdate<"courses"> = {
    title: nullableString(formData.get("title")) ?? undefined,
    slug: nullableString(formData.get("slug")) ?? undefined,
    subtitle: nullableString(formData.get("subtitle")),
    short_description: nullableString(formData.get("short_description")),
    description: nullableString(formData.get("description")),
    delivery_type: pickDelivery(formData.get("delivery_type")),
    difficulty_level: nullableString(formData.get("difficulty_level")),
    estimated_duration_hours: nullableNumber(
      formData.get("estimated_duration_hours"),
    ),
    language_code: nullableString(formData.get("language_code")) ?? "en",
    thumbnail_url: thumbnailUrl,
    featured_image_url: featuredUrl,
    intro_video_url: nullableString(formData.get("intro_video_url")),
    price_amount: nullableNumber(formData.get("price_amount")) ?? 0,
    currency_code: nullableString(formData.get("currency_code")) ?? "GBP",
    is_free: bool(formData.get("is_free")),
    certificate_enabled: bool(formData.get("certificate_enabled")),
    allow_discussions: bool(formData.get("allow_discussions")),
    allow_comments: bool(formData.get("allow_comments")),
    tags,
  };

  if (!update.title) {
    return {
      status: "error",
      message: "Title is required.",
      fieldErrors: { title: "Title is required." },
    };
  }
  if (!update.slug) {
    return {
      status: "error",
      message: "Slug is required.",
      fieldErrors: { slug: "Slug is required." },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update(update)
    .eq("id", courseId);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Slug already exists.",
        fieldErrors: { slug: "Already used by another course." },
      };
    }
    return { status: "error", message: error.message };
  }

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/instructor/courses");
  return { status: "success", message: "Course saved." };
}

export async function setCoursePublishAction(
  courseId: string,
  publish: boolean,
): Promise<void> {
  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const supabase = await createClient();
  const update: TablesUpdate<"courses"> = publish
    ? { visibility: "public", published_at: new Date().toISOString() }
    : { visibility: "draft" };

  await supabase.from("courses").update(update).eq("id", courseId);

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/instructor/courses");
  revalidatePath("/courses");
}

export async function archiveCourseAction(courseId: string): Promise<void> {
  const user = await requireUser();
  await assertCanEditCourse(user.id, courseId);

  const supabase = await createClient();
  await supabase
    .from("courses")
    .update({
      visibility: "archived",
      archived_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  revalidatePath("/instructor/courses");
  redirect("/instructor/courses");
}
