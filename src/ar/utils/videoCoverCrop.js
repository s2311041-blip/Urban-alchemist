/**
 * object-fit: cover で見えている範囲を、元フレーム座標で返す。
 * 撮影プレビューと保存写真の切り取りを一致させる。
 */
export function getCoverCropSource(videoWidth, videoHeight, viewWidth, viewHeight) {
  if (!videoWidth || !videoHeight || !viewWidth || !viewHeight) {
    return { sx: 0, sy: 0, sw: videoWidth || 0, sh: videoHeight || 0 };
  }

  const videoRatio = videoWidth / videoHeight;
  const viewRatio = viewWidth / viewHeight;

  if (videoRatio > viewRatio) {
    const sw = videoHeight * viewRatio;
    return {
      sx: (videoWidth - sw) / 2,
      sy: 0,
      sw,
      sh: videoHeight,
    };
  }

  const sh = videoWidth / viewRatio;
  return {
    sx: 0,
    sy: (videoHeight - sh) / 2,
    sw: videoWidth,
    sh,
  };
}

export function captureVideoCoverFrame(video, { quality = 0.92 } = {}) {
  if (!video || video.readyState < 2) return null;
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  if (!videoWidth || !videoHeight) return null;

  const viewWidth = video.clientWidth || videoWidth;
  const viewHeight = video.clientHeight || videoHeight;
  const { sx, sy, sw, sh } = getCoverCropSource(
    videoWidth,
    videoHeight,
    viewWidth,
    viewHeight,
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sw));
  canvas.height = Math.max(1, Math.round(sh));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}
