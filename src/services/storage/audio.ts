import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export class StorageServiceError extends Error {}

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new StorageServiceError("storage_not_configured");
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function clientFor(values: ReturnType<typeof config>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${values.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: values.accessKeyId, secretAccessKey: values.secretAccessKey },
  });
}

export async function uploadPrivateRecitation(input: { userId: string; shlokaId: string; bytes: Uint8Array; mimeType: string }) {
  const values = config();
  const extension = { "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/wav": "wav", "audio/x-wav": "wav" }[input.mimeType] ?? "audio";
  const objectKey = `recitations/${input.userId}/${input.shlokaId}/${crypto.randomUUID()}.${extension}`;
  const client = clientFor(values);
  await client.send(new PutObjectCommand({
    Bucket: values.bucket,
    Key: objectKey,
    Body: input.bytes,
    ContentType: input.mimeType,
    CacheControl: "private, no-store",
    Metadata: { "asset-type": "user-recitation" },
  }));
  return objectKey;
}

export async function deletePrivateRecitations(objectKeys: string[]) {
  if (objectKeys.length === 0) return;
  const values = config();
  const client = clientFor(values);
  for (let index = 0; index < objectKeys.length; index += 1000) {
    const batch = objectKeys.slice(index, index + 1000);
    await client.send(new DeleteObjectsCommand({
      Bucket: values.bucket,
      Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
    }));
  }
}
