/** ワークショップ中は昼夜を進めず、昼の見た目で固定する。発表後は false に戻す。 */
export const WORKSHOP_LOCK_DAYTIME = true;

/** 昼の時間帯（0.32〜0.68）の中央 */
export const WORKSHOP_DAY_TIME = 0.5;

export function withWorkshopDaytime(worldTime = {}) {
  if (!WORKSHOP_LOCK_DAYTIME) return worldTime;
  return {
    ...worldTime,
    timeOfDay: WORKSHOP_DAY_TIME,
  };
}
