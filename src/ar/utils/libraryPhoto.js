const MAX_EDGE = 1600;
const MAX_BYTES = 2_400_000;

export function fitImageSize(width, height, maxEdge = MAX_EDGE) {
  const w = Math.max(0, Number(width) || 0);
  const h = Math.max(0, Number(height) || 0);
  const edge = Math.max(w, h);
  if (!edge || edge <= maxEdge) return { width: Math.max(1, Math.round(w || 1)), height: Math.max(1, Math.round(h || 1)) };
  const scale = maxEdge / edge;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

function estimateDataUrlBytes(dataUrl) {
  const base64 = String(dataUrl ?? '').split(',')[1] ?? '';
  return Math.floor(base64.length * 0.75);
}

async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // 対応していない形式は Image でもう一度試す
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('decode'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawJpeg(source, width, height, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('decode');
  ctx.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

export async function fileToJpegDataUrl(file) {
  if (!file || (file.type && !file.type.startsWith('image/'))) {
    throw new Error('not_image');
  }
  const source = await decodeImage(file);
  try {
    let size = fitImageSize(source.width, source.height);
    let dataUrl = '';
    for (let pass = 0; pass < 3; pass += 1) {
      let quality = 0.86;
      dataUrl = drawJpeg(source, size.width, size.height, quality);
      while (estimateDataUrlBytes(dataUrl) > MAX_BYTES && quality > 0.5) {
        quality = Math.round((quality - 0.08) * 100) / 100;
        dataUrl = drawJpeg(source, size.width, size.height, quality);
      }
      if (estimateDataUrlBytes(dataUrl) <= MAX_BYTES) return dataUrl;
      size = fitImageSize(size.width, size.height, Math.round(Math.max(size.width, size.height) * 0.7));
    }
    if (estimateDataUrlBytes(dataUrl) > MAX_BYTES) throw new Error('too_large');
    return dataUrl;
  } finally {
    source.close?.();
  }
}

export function libraryPhotoErrorMessage(error) {
  if (error?.message === 'not_image') return '画像ファイルを選んでください';
  if (error?.message === 'too_large') return '写真が大きすぎます。別の写真を選んでください';
  return 'この写真は読み込めませんでした。別の写真を選んでください';
}
