export function initialPostPhase({ isEdit = false, previewNoticeForm = false, postEntry = null } = {}) {
  if (isEdit || previewNoticeForm) return 'form';
  if (postEntry?.photoSource === 'library' && postEntry.photo) return 'annotate';
  return 'capture';
}

/** 写真上のピンの次。フォルダ写真は、質問の前に地図で場所を指す。 */
export function nextPhaseAfterPhotoPin(photoSource) {
  return photoSource === 'library' ? 'locate' : 'form';
}
