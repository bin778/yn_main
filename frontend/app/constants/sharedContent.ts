/**
 * Copy and paths shared across home, about, and layout components.
 */

export const CONTACT_HREF = '/contact';

export type CoreValueShort = {
  title: string;
  subtitle: string;
};

export const CORE_VALUES_SHORT: readonly CoreValueShort[] = [
  { title: '사랑', subtitle: '우리는 사건 이면의 사람을 사랑한다.' },
  { title: '신뢰', subtitle: '우리는 고객과의 약속을 반드시 지킨다.' },
  { title: '도전', subtitle: '우리는 위기를 즐기고 기회로 만든다.' },
] as const;
