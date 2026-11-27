import { SATISFACTION_ATTR_BY_KEY } from './satisfactionAttributes';

/** 満足度4属性を、街に立つ人物として見せる。計算キーは属性のまま。 */
export const PERSONAS = [
  {
    key: 'link',
    name: 'スムーズに移動したい人',
    role: '通勤・通学',
    blurb: 'スイスイ進みたい',
    color: SATISFACTION_ATTR_BY_KEY.link.color,
  },
  {
    key: 'place',
    name: '街でゆっくり過ごしたい人',
    role: '高齢者・家族連れ',
    blurb: 'ゆっくり過ごしたい',
    color: SATISFACTION_ATTR_BY_KEY.place.color,
  },
  {
    key: 'inclusive',
    name: '安全・安心にまちを利用したい人',
    role: '車椅子・ベビーカー',
    blurb: '段差や危険をなくしたい',
    color: SATISFACTION_ATTR_BY_KEY.inclusive.color,
  },
  {
    key: 'livability',
    name: '静かに暮らしたい人',
    role: '近隣住民',
    blurb: '静かに暮らしたい',
    color: SATISFACTION_ATTR_BY_KEY.livability.color,
  },
];

const byKey = Object.fromEntries(PERSONAS.map((persona) => [persona.key, persona]));

export function getPersona(key) {
  return byKey[key] ?? null;
}

export function getPersonaByAttribute(attributeKey) {
  return getPersona(attributeKey);
}
