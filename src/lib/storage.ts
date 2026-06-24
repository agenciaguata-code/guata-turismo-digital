import { supabase } from "@/integrations/supabase/client";

// 10 years — effectively permanent for our use case (covers/avatars).
const LONG_EXPIRY = 60 * 60 * 24 * 365 * 10;

export type UploadBucket = "course-covers" | "avatars" | "lesson-materials";

/**
 * Upload a file and return a long-lived signed URL ready to be stored
 * in a *_url column (covers, avatars). Buckets are private; signed URLs
 * carry their own authentication.
 */
export async function uploadAndSignUrl(
  bucket: UploadBucket,
  path: string,
  file: File,
  opts: { upsert?: boolean } = {},
): Promise<{ url: string; path: string }> {
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: opts.upsert ?? true,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });
  if (upErr) throw upErr;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, LONG_EXPIRY);
  if (error || !data) throw error ?? new Error("Falha ao gerar URL");
  return { url: data.signedUrl, path };
}

export async function signUrl(bucket: UploadBucket, path: string, expiresIn = LONG_EXPIRY) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) throw error ?? new Error("Falha ao gerar URL");
  return data.signedUrl;
}

export async function removeFile(bucket: UploadBucket, path: string) {
  return supabase.storage.from(bucket).remove([path]);
}
