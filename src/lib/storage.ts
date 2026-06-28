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
  console.info("[storage] upload start", { bucket, path, size: file.size, type: file.type });
  const { data: sess } = await supabase.auth.getSession();
  console.info("[storage] session user", sess.session?.user?.id ?? "(anon)");

  const { error: upErr, data: upData } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: opts.upsert ?? true,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });
  if (upErr) {
    console.error("[storage] upload error", { bucket, path, error: upErr });
    // Surface the real Supabase error message (e.g. "Bucket not found",
    // "new row violates row-level security policy", "JWT expired").
    throw new Error(`[${bucket}] ${upErr.message}`);
  }
  console.info("[storage] upload ok", upData);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, LONG_EXPIRY);
  if (error || !data) {
    console.error("[storage] sign error", { bucket, path, error });
    throw new Error(`[${bucket}] ${error?.message ?? "Falha ao gerar URL assinada"}`);
  }
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
