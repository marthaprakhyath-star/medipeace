export async function resizeImageFile(file: File, size = 256): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("image");
  }
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("image");
  const min = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - min) / 2;
  const sy = (bitmap.height - min) / 2;
  ctx.drawImage(bitmap, sx, sy, min, min, 0, 0, size, size);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (dataUrl.length > 350_000) {
    return canvas.toDataURL("image/jpeg", 0.6);
  }
  return dataUrl;
}
