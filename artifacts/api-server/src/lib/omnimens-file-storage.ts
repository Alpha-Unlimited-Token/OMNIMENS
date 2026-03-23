import { db } from "@workspace/db";
import { omnimensUserFiles } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { objectStorageClient } from "./objectStorage.js";
import { randomUUID } from "crypto";

function getPrivateObjectDir(): string {
  return process.env.PRIVATE_OBJECT_DIR || "";
}

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  if (!path.startsWith("/")) path = `/${path}`;
  const parts = path.split("/");
  if (parts.length < 3) throw new Error("Invalid path");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

export async function uploadBufferToStorage(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<{ storageKey: string; fileSize: number }> {
  const dir = getPrivateObjectDir();
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR not set");

  const objectId = randomUUID();
  const ext = filename.includes(".") ? filename.split(".").pop() : "";
  const storagePath = `${dir}/user-files/${objectId}${ext ? `.${ext}` : ""}`;
  const { bucketName, objectName } = parseObjectPath(storagePath);

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: { metadata: { originalFilename: filename } },
  });

  return { storageKey: storagePath, fileSize: buffer.length };
}

export async function autoSaveFile(opts: {
  userId: string;
  conversationId?: number;
  projectId?: number;
  buffer: Buffer;
  filename: string;
  fileType: string;
  mimeType: string;
  prompt?: string;
  metadata?: Record<string, unknown>;
}): Promise<number> {
  const { storageKey, fileSize } = await uploadBufferToStorage(
    opts.buffer,
    opts.filename,
    opts.mimeType,
  );

  try {
    const [inserted] = await db
      .insert(omnimensUserFiles)
      .values({
        userId: opts.userId,
        conversationId: opts.conversationId ?? null,
        projectId: opts.projectId ?? null,
        filename: opts.filename,
        fileType: opts.fileType,
        mimeType: opts.mimeType,
        fileSize,
        storageKey,
        prompt: opts.prompt ?? null,
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
      })
      .returning({ id: omnimensUserFiles.id });

    return inserted.id;
  } catch (dbErr) {
    try {
      const { bucketName, objectName } = parseObjectPath(storageKey);
      await objectStorageClient.bucket(bucketName).file(objectName).delete();
    } catch {}
    throw dbErr;
  }
}

export async function autoSaveImage(
  userId: string,
  conversationId: number | undefined,
  imageBuffer: Buffer,
  prompt: string,
  provider: string,
  index: number,
): Promise<number> {
  const timestamp = Date.now();
  const filename = `omnimens_image_${timestamp}_${index}.png`;
  return autoSaveFile({
    userId,
    conversationId,
    buffer: imageBuffer,
    filename,
    fileType: "image",
    mimeType: "image/png",
    prompt,
    metadata: { provider, generatedAt: new Date().toISOString() },
  });
}

export async function autoSaveVideo(
  userId: string,
  conversationId: number | undefined,
  videoBuffer: Buffer,
  prompt: string,
  provider: string,
): Promise<number> {
  const timestamp = Date.now();
  const filename = `omnimens_video_${timestamp}.mp4`;
  return autoSaveFile({
    userId,
    conversationId,
    buffer: videoBuffer,
    filename,
    fileType: "video",
    mimeType: "video/mp4",
    prompt,
    metadata: { provider, generatedAt: new Date().toISOString() },
  });
}

export async function autoSave3DModel(
  userId: string,
  conversationId: number | undefined,
  glbBase64: string,
  prompt: string,
  toolUsed: string,
): Promise<number> {
  const timestamp = Date.now();
  const filename = `omnimens_3d_${timestamp}.glb`;
  const buffer = Buffer.from(glbBase64, "base64");
  return autoSaveFile({
    userId,
    conversationId,
    buffer,
    filename,
    fileType: "3d_model",
    mimeType: "model/gltf-binary",
    prompt,
    metadata: { toolUsed, generatedAt: new Date().toISOString() },
  });
}

export async function autoSaveGameZip(
  userId: string,
  conversationId: number | undefined,
  zipBase64: string,
  title: string,
  prompt: string,
): Promise<number> {
  const timestamp = Date.now();
  const safeName = title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  const filename = `omnimens_game_${safeName}_${timestamp}.zip`;
  const buffer = Buffer.from(zipBase64, "base64");
  return autoSaveFile({
    userId,
    conversationId,
    buffer,
    filename,
    fileType: "game",
    mimeType: "application/zip",
    prompt,
    metadata: { title, generatedAt: new Date().toISOString() },
  });
}

export async function autoSaveCodeFile(
  userId: string,
  conversationId: number | undefined,
  code: string,
  filename: string,
  language: string,
): Promise<number> {
  const buffer = Buffer.from(code, "utf-8");
  return autoSaveFile({
    userId,
    conversationId,
    buffer,
    filename,
    fileType: "code",
    mimeType: "text/plain",
    metadata: { language, generatedAt: new Date().toISOString() },
  });
}

export async function autoSaveAudio(
  userId: string,
  conversationId: number | undefined,
  audioBuffer: Buffer,
  filename: string,
  mimeType: string,
  prompt?: string,
): Promise<number> {
  return autoSaveFile({
    userId,
    conversationId,
    buffer: audioBuffer,
    filename,
    fileType: "audio",
    mimeType,
    prompt,
    metadata: { generatedAt: new Date().toISOString() },
  });
}

export async function getUserFiles(
  userId: string,
  limit = 50,
  offset = 0,
  fileType?: string,
): Promise<typeof omnimensUserFiles.$inferSelect[]> {
  const conditions = [eq(omnimensUserFiles.userId, userId)];
  if (fileType) conditions.push(eq(omnimensUserFiles.fileType, fileType));

  return db
    .select()
    .from(omnimensUserFiles)
    .where(and(...conditions))
    .orderBy(desc(omnimensUserFiles.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUserFileById(
  userId: string,
  fileId: number,
): Promise<typeof omnimensUserFiles.$inferSelect | null> {
  const [file] = await db
    .select()
    .from(omnimensUserFiles)
    .where(and(eq(omnimensUserFiles.id, fileId), eq(omnimensUserFiles.userId, userId)))
    .limit(1);
  return file || null;
}

export async function deleteUserFile(userId: string, fileId: number): Promise<boolean> {
  const file = await getUserFileById(userId, fileId);
  if (!file) return false;

  try {
    const { bucketName, objectName } = parseObjectPath(file.storageKey);
    const bucket = objectStorageClient.bucket(bucketName);
    await bucket.file(objectName).delete().catch(() => {});
  } catch {}

  await db
    .delete(omnimensUserFiles)
    .where(and(eq(omnimensUserFiles.id, fileId), eq(omnimensUserFiles.userId, userId)));
  return true;
}

export async function getFileDownloadUrl(storageKey: string): Promise<string> {
  const { bucketName, objectName } = parseObjectPath(storageKey);
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 3600 * 1000,
  });
  return url;
}

export async function streamFileToResponse(
  storageKey: string,
  res: import("express").Response,
  filename: string,
  mimeType: string,
  inline = false,
): Promise<void> {
  const { bucketName, objectName } = parseObjectPath(storageKey);
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  const [metadata] = await file.getMetadata();
  res.setHeader("Content-Type", mimeType);
  if (metadata.size) res.setHeader("Content-Length", String(metadata.size));
  res.setHeader(
    "Content-Disposition",
    inline ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`,
  );
  res.setHeader("Cache-Control", "private, max-age=3600");

  const stream = file.createReadStream();
  stream.pipe(res);
  stream.on("error", () => {
    if (!res.headersSent) res.status(500).json({ error: "File download failed" });
  });
}

export async function getUserFileStats(userId: string): Promise<{
  totalFiles: number;
  totalSizeBytes: number;
  byType: Record<string, number>;
}> {
  const files = await db
    .select({
      fileType: omnimensUserFiles.fileType,
      fileSize: omnimensUserFiles.fileSize,
    })
    .from(omnimensUserFiles)
    .where(eq(omnimensUserFiles.userId, userId));

  const byType: Record<string, number> = {};
  let totalSizeBytes = 0;
  for (const f of files) {
    byType[f.fileType] = (byType[f.fileType] || 0) + 1;
    totalSizeBytes += f.fileSize;
  }
  return { totalFiles: files.length, totalSizeBytes, byType };
}

export async function getConversationFiles(
  userId: string,
  conversationId: number,
): Promise<typeof omnimensUserFiles.$inferSelect[]> {
  return db
    .select()
    .from(omnimensUserFiles)
    .where(
      and(
        eq(omnimensUserFiles.userId, userId),
        eq(omnimensUserFiles.conversationId, conversationId),
      ),
    )
    .orderBy(desc(omnimensUserFiles.createdAt));
}
