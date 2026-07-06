/**
 * About page (`/about`) copy and assets from legacy `www/about.php` (L30319–31326).
 */

export type AboutHero = {
  title: string;
  subtitle: string;
  bgMobile: string;
  bgDesktop: string;
};

export type AboutIntro = {
  titleLines: readonly string[];
  paragraphs: readonly string[];
  imageSrc: string;
};

export type AboutCoreValue = {
  title: string;
  subtitle: string;
  cardBgSrc: string;
};

export type CertificateSlide = {
  src: string;
  label: string;
};

export type AboutPillar = {
  iconSrc: string;
  titleLine1: string;
  titleLine2: string;
  paragraphs: readonly string[];
};

export type GallerySlide = {
  src: string;
};

export const ABOUT_PAGE_TITLE = '형사전문 법무법인 여온 | 담당 변호사 직접 진행, 변호사 재배당 없는 법무법인';
export const ABOUT_PAGE_DESCRIPTION =
  '담당 변호사가 바뀌지 않습니다. 사무장 없이 변호사가 직접 진행. 월 수임건수 제한으로 의뢰인 사건에 집중합니다.';

export const ABOUT_HERO: AboutHero = {
  title: '여온의 약속',
  subtitle: '법무법인 여온과 함께라면 당신의 문제는 여행이 됩니다.',
  bgMobile: '/img/3fe2f556b1f74.webp',
  bgDesktop: '/img/a9471468d356a.webp',
};

export const ABOUT_INTRO: AboutIntro = {
  titleLines: ['여기,', '온전한 당신 편', '법무법인 여온'],
  paragraphs: [
    '사건은 단순한 분쟁을 넘어 삶의 중요한 갈림길이 되기도 합니다. 해결 중심의 변호사는 형식적인 승패만을 최우선 가치로 삼습니다. 반면, 해방 중심의 변호사는 사건 이면의 사람에게 집중하고 의뢰인이 미래를 살아가도록 길을 열어드립니다.',
    '“여온은 사건 너머의 사람” 에게 집중하고, 권리를 주장하지 못하는 의뢰인을 위해 목소리를 내겠습니다. “여온이 해서 안되면, 누가 해도 안된다” 는 자신감으로 치열하게 여러분의 삶을 변호하겠습니다.',
    '“여기, 온전한 당신편 ‘법무법인 여온’” 당신이 사건에서 해방되는 그 순간까지 함께하겠습니다.',
  ],
  imageSrc: '/img/about.webp',
};

export const CORE_VALUES_SECTION_TITLE = '여온의 핵심가치';
export const CORE_VALUES_INTRO = '좋은 변호사란 좋은 가이드와 같습니다. 여온은 항상 여러분의 좋은 가이드가 되겠습니다.';

const CORE_VALUE_CARD_BG = '/img/da1a5a8aa3e87.webp';

export const ABOUT_CORE_VALUES: readonly AboutCoreValue[] = [
  {
    title: '사랑, 여온이 존재하는 이유',
    subtitle: '우리는 사건 이면의 사람을 사랑한다.',
    cardBgSrc: CORE_VALUE_CARD_BG,
  },
  {
    title: '신뢰, 여온이 사랑받는 이유',
    subtitle: '우리는 고객과의 약속을 반드시 지킨다.',
    cardBgSrc: CORE_VALUE_CARD_BG,
  },
  {
    title: '도전, 여온이 두려워하지 않는 이유',
    subtitle: '우리는 위기를 즐기고 기회로 만든다.',
    cardBgSrc: CORE_VALUE_CARD_BG,
  },
] as const;

export const CERTIFICATE_SLIDES: readonly CertificateSlide[] = [
  { src: '/img/fsa14f5sdf45gd6fgd12bvc5.webp', label: '임명장' },
  { src: '/img/3b0b09fb1b763.webp', label: '위촉장' },
  { src: '/img/aad839fc457ac.webp', label: '수료증' },
  { src: '/img/987ffe449ee48.webp', label: '당선증' },
  { src: '/img/003dc11eb0efa.webp', label: '전문분야 등록증서' },
  { src: '/img/120951a18c7a4.webp', label: '전문분야 등록증서' },
  { src: '/img/ebde4267c5079.webp', label: '전문분야 등록증서' },
  { src: '/img/d909def7bb459.webp', label: '전문분야 등록증서' },
] as const;

export const EXPERTISE_TITLE = '여온은 전문 변호사들이 모인 강한 로펌입니다.';
export const EXPERTISE_BODY_LINES = [
  "'여온이 해서 안되면 누가 해도 안된다'는 자신감과 전문성으로 여러분의 든든한 법률 가이드가 되어 드리겠습니다.",
  "'사건별 맞춤 전략' 여온의 약속이자 자신감입니다.",
] as const;
export const EXPERTISE_CTA_LABEL = '여온과 함께하기';
export const EXPERTISE_BG_MOBILE = '/img/f861b619b2567.webp';
export const EXPERTISE_BG_DESKTOP = '/img/efea247eb9e9d.webp';

export const ABOUT_PILLARS: readonly AboutPillar[] = [
  {
    iconSrc: '/img/122c7621794a6.webp',
    titleLine1: '확실한 경험,',
    titleLine2: '사건별 맞춤 전략',
    paragraphs: [
      "이 세상에 똑같은 사람은 없습니다. 마찬가지로 똑같은 사건도 없습니다. 사건은 관계에서 발생하는 것이기에 내가 기억하는 사실만으로 결과를 장담 할 수 없습니다. 결국 '사건'은 나와 상대방, 그리고 법질서가 복합적으로 얽혀 결론에 이릅니다. 그래서 과거의 '성공사례', '전관'을 앞세워 최고의 결과를 담보한다면 당신의 눈과 귀를 가리고 사건을 수임하는 셈입니다.",
      '법무법인 여온은 불확실한 결과를 담보하면서 당신을 현혹하지 않겠습니다. 다만, 사건 해결 과정 에서 위로와 치유의 경험을 선사하겠습니다. 당신과 소통하기 위해 최선의 노력을 다하겠습니다. 약속을 못 지킨다면, 착수보수 모두를 돌려드립니다.',
    ],
  },
  {
    iconSrc: '/img/52e0abdb9accd.webp',
    titleLine1: '당신에게 집중하기 위해',
    titleLine2: '월 수임 건수 제한',
    paragraphs: [
      "누구나 '첫 사랑'이 있습니다. 첫 사랑은 오로지 그 사람에게 집중합니다. 법무법인 여온은 여러분의 '첫사랑'이고 싶습니다. 오직 당신에게 집중하겠습니다.",
      '법무법인 여온은 당신에게 집중하고자 월 수임 건수를 제한하고 있습니다. 너무 많은 사건은 당신에 대한 집중을 흐리기 때문이죠. 조기에 월 수임건수가 마감될 수 있습니다.',
    ],
  },
  {
    iconSrc: '/img/13808c4a6654c.webp',
    titleLine1: '당신의',
    titleLine2: '여행 가이드',
    paragraphs: [
      "여행(travel)의 어원은 문제(trouble)입니다. 여행은 문제 상황에 자신을 던지는 것입니다. 당신은 문제에 던져진 '여행자'이고, 그 여행을 함께할 '가이드'를 찾고 있습니다. 여온은 당신의 훌륭한 여행가이드가 되어 드리겠습니다.",
      '당신의 문제를 반드시 소송, 고소로만 해결할 필요는 없습니다. 부담스럽지 않은 방법으로, 쉽고 빠르게 여행을 마칠 수 있는 방법을 찾아드리겠습니다.',
    ],
  },
] as const;

export const OFFICE_GALLERY_SLIDES: readonly GallerySlide[] = [
  { src: '/img/79b27799fca6e.webp' },
  { src: '/img/973b29835148b.webp' },
  { src: '/img/dc5c3dbbdfe0e.webp' },
  { src: '/img/a7a01cb88d0a3.webp' },
  { src: '/img/648dece172f57.webp' },
  { src: '/img/d8782710af822.webp' },
  { src: '/img/4900e90fffc8f.webp' },
] as const;
