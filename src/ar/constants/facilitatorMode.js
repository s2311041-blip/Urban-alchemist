/** ファシリ・研究用 UI（JSON 書き出し等）を表示するか */
export function isFacilitatorMode() {
  return import.meta.env.VITE_AR_FACILITATOR === 'true';
}
