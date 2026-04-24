import { createClient } from "@/lib/supabase/server";

export async function createSignedDownloadUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 60,
  options?: { downloadAs?: string },
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds, {
      download: options?.downloadAs ?? false,
    });
  return data?.signedUrl ?? null;
}
