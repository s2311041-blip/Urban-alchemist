import { isValidGeoCoordinate } from '../constants/kotoArea';

const MIN_COMMENT_LEN = 1;
const MAX_COMMENT_LEN = 500;
const MAX_PHOTO_BYTES = 2_500_000;

export function validateDraftForSubmit(draft) {
  const errors = [];

  if (!draft.worldPin) {
    errors.push('場所（ピン）が指定されていません');
  } else if (!isValidGeoCoordinate(draft.worldPin.lat, draft.worldPin.lng)) {
    errors.push('位置情報が不正です');
  }

  const comment = draft.comment?.trim() ?? '';
  if (comment.length < MIN_COMMENT_LEN) {
    errors.push('コメントを入力してください');
  }
  if (comment.length > MAX_COMMENT_LEN) {
    errors.push(`コメントは${MAX_COMMENT_LEN}文字以内にしてください`);
  }

  if (draft.photo && estimateDataUrlBytes(draft.photo) > MAX_PHOTO_BYTES) {
    errors.push('写真が大きすぎます。もう一度撮影してください');
  }

  return errors;
}

function estimateDataUrlBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.floor(base64.length * 0.75);
}

export function mapPostErrorMessage(error) {
  const msg = error?.message ?? String(error ?? '');
  if (msg.includes('rate_limit')) {
    return '投稿が多すぎます。1時間後に再度お試しください';
  }
  if (msg.includes('check constraint') || msg.includes('ar_world_')) {
    return '位置情報が不正です';
  }
  if (msg.includes('row-level security') || msg.includes('JWT')) {
    return 'ログインに失敗しました。ページを再読み込みしてください';
  }
  return '投稿に失敗しました';
}
