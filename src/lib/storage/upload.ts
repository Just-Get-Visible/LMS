import { createClient } from "@/lib/supabase/server";

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean },
): Promise<UploadResult> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: options?.upsert ?? false,
    contentType: file.type || undefined,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, path };
}

export async function getPublicUrl(
  bucket: string,
  path: string,
): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
