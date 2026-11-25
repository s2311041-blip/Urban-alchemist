export function initialPostPhase({ isEdit = false, previewNoticeForm = false, postEntry = null } = {}) {
  if (isEdit || previewNoticeForm) return 'form';
  if (postEntry?.photoSource === 'library' && postEntry.photo) return 'annotate';
  return 'capture';
}
