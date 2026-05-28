/**
 * Home page copy and asset paths migrated from legacy `www/index.php`.
 * Section order: Hero → WhoWeAre → Concerns → FAQ → ThreeReasons → Process/Social.
 */

export { CONTACT_HREF, CORE_VALUES_SHORT } from '@/app/constants/sharedContent';

export type HeroSlideMobile = {
  backgroundSrc: string;
  title: string;
  bodyLines: string[];
};

export const HERO_SLIDES_MOBILE: readonly HeroSlideMobile[] = [
  {
    backgroundSrc: '/img/c2b6463d91835.webp',
    title: '사랑',
    bodyLines: [
      '우리는 사건 이면의 사람을 사랑한다.',
      '법이 아니라 사람을 먼저 읽는 변호사.',
      '당신의 마음부터 지킵니다.',
    ],
  },
  {
    backgroundSrc: '/img/92e6e060d5d05.webp',
    title: '신뢰',
    bodyLines: [
      '우리는 고객과의 약속을 반드시 지킨다.',
      '한 달 수임건수 제한.',
      '온전한 당신 편이 되기 위해 과감히 포기하겠습니다.',
    ],
  },
  {
    backgroundSrc: '/img/5fbfd6fa948ee.webp',
    title: '도전',
    bodyLines: [
      '우리는 길을 내는 사람이다.',
      '멈추지 않고 계속 나아간다.',
      '승리를 넘어 문제로부터',
      '완전히 해방되는 그날까지 멈추지 않습니다.',
    ],
  },
] as const;

export type HeroSlideDesktop = Omit<HeroSlideMobile, 'bodyLines'> & {
  bodyLineSingle: string;
  lawyerRole: string;
  lawyerName: string;
  lawyerBioLines: readonly string[];
  lawyerCardBgSrc: string;
};

export const HERO_SLIDES_DESKTOP: readonly HeroSlideDesktop[] = [
  {
    backgroundSrc: '/img/33e5546a13ea7.webp',
    title: '사랑',
    bodyLineSingle:
      '우리는 사건 이면의 사람을 사랑한다.\n법이 아니라 사람을 먼저 읽는 변호사. 당신의 마음부터 지킵니다.',
    lawyerRole: '대표 변호사',
    lawyerName: '유영규',
    lawyerBioLines: [
      '대한변호사협회 인증 형사전문변호사',
      '대한변호사협회 전문직 성년후견인 양성과정 수료',
      '現 한국애견연맹 상벌위원회 위원',
      '現 브솔복지재단 감사',
      '現 한국애견연맹 부위원장',
      '現 충현복지관 자문위원',
      '現 한국자폐인사랑협회 신탁재산관리위원회 위원',
      '現 한국신탁학회 회원',
      '現 대한변호사협회 신탁변호사회 회원',
      '現 재한몽골학교 자문변호사',
    ],
    lawyerCardBgSrc: '/img/silder_lawyer01.webp',
  },
  {
    backgroundSrc: '/img/d8625d25ce97f.webp',
    title: '신뢰',
    bodyLineSingle:
      '우리는 고객과의 약속을 반드시 지킨다.\n한 달 수임건수 제한. 온전한 당신 편이 되기 위해 과감히 포기하겠습니다.',
    lawyerRole: '변호사',
    lawyerName: '김환섭',
    lawyerBioLines: [
      '대한변호사협회 인증 형사전문변호사',
      '대한변호사협회 인증 민사전문변호사',
      '現 서울지방변호사회 광고심사위원',
      '現 서울시 공익변호사',
      '現 대한변호사협회 대의원',
      '前 서울북부지방법원 국선변호인',
      '前 서울재동초등학교 변호사명예교사',
      '前 사단법인 한국부인회 충청북도 지부 자문변호사',
      '前 ROTC 48기 총동기회 법무국장',
    ],
    lawyerCardBgSrc: '/img/silder_lawyer02.webp',
  },
  {
    backgroundSrc: '/img/c3ecf7a5dc46c.webp',
    title: '도전',
    bodyLineSingle:
      '우리는 길을 내는 사람이다. 멈추지 않고 계속 나아간다.\n승리를 넘어 문제로부터 완전히 해방되는 그날까지 멈추지 않습니다.',
    lawyerRole: '변호사',
    lawyerName: '홍기웅',
    lawyerBioLines: [
      '現 서울시 공익변호사',
      '現 서울북부지원교육청 교권심사위원회 위원',
      '前 주식회사 제노레이 자문변호사',
      '前 주식회사 신화콘텍 자문변호사',
      '前 주식회사 선텍 자문변호사',
      '前 성동패션봉제인연합회 자문변호사',
      '前 주식회사 승신건설 자문변호사',
      '前 주식회사 진성해운 자문변호사',
    ],
    lawyerCardBgSrc: '/img/silder_lawyer03.webp',
  },
] as const;

export const WHO_WE_ARE_LABEL = 'WHO WE ARE';
export const WHO_WE_ARE_TITLE = '여기, 온전한 당신 편';
export const WHO_WE_ARE_TITLE_LINE1 = '여기,';
export const WHO_WE_ARE_TITLE_LINE2 = '온전한 당신 편';
export const WHO_WE_ARE_IMAGE_SRC = '/img/e6f3b4ca76dc2.webp';

export const WHO_WE_ARE_PARAGRAPHS: readonly string[] = [
  '고민을 안고 출근하지 마세요.',
  '고민을 안고 퇴근하지 마세요.',
  '오늘의 고민, 내일로 미루지 마세요.',
  '고민은 여온에 맡기고, 일상을 찾으세요.',
  '여온은 형사, 민사, 가사, 강제집행 각 분야 전문성을 갖춘 변호사들이 모인 작지만 강한 로펌입니다.',
  '"여온이 해서 안되면 누가 해도 안된다"는 자신감과 전문성으로 오직 당신만을 위한 법률가이드가 되어 드리겠습니다.',
];

export const CONCERNS_BG_SRC = '/img/096860b633d57.webp';
export const CONCERNS_TITLE = '이런 걱정\n하고 계신가요?';

export const FAQ_SECTION_BG_SRC = '/img/8cd752249cde5.webp';
export const FAQ_TITLE = '이런 걱정\n하고 계신가요?';

export type FaqItem = { question: string; answer: string };

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Q. 비싼 광고를 냈으니 비싼 수임료를 받는 거 아니야?',
    answer: `변호사 3만 명 시대, 경쟁이 치열합니다.
그만큼 광고에 들이는 비용도 많아졌는데요.
가령, 성범죄 키워드는 클릭당 10만 원을 호가합니다.
하지만 결국 치킨 게임입니다.
누가 더 많은 자본을 투입해 끝내 생존하느냐의 문제입니다.
하지만 그 광고비용은 누구의 부담일까요?
결국 의뢰인(소비자)의 몫입니다.
과도한 광고비용을 상쇄하기 위해 무리한 수임을 할 수밖에 없고, 그 피해는 고스란히 의뢰인의 몫으로 돌아갑니다.
(그래서 공격적인 마케팅을 하는 법무법인는 더 철저한 검증이 필요합니다)
여온은 광고대행사를 통하지 않습니다.
그저 우리의 진정성이 당신에게 전달되길 진득하게 기다리고 있습니다.
그만큼 광고로 소비되는 비용을 절약하고, 당신의 이익을 위해 사용하겠습니다.`,
  },
  {
    question: 'Q. 다른 로펌에서는 사건 담당 변호사가 계속 바뀐다던데?',
    answer: `“기존 담당 변호사가 퇴사했습니다. 제가 재배당받은 변호사입니다. 사건 파악은 아직 못 했고요…(아마 조만간 다시 재배당 될 겁니다)” X3
만약, 당신의 사건을 로펌에 맡겼는데 담당 변호사가 계속 바뀐다면?
어떤 느낌일까요?
실제로 중견 로펌에 사건을 의뢰하셨지만, 담당 변호사의 잦은 퇴사로 수차례 재배당을 엮은 의뢰인은 아래와 같은 느낌을 받으셨다고 합니다.
“변호사들에게 ‘윤간’ 당한 거 같아요”
물론 극단적인 감상일 수 있지만 내 인생 일대의 사건이 변호사 퇴사를 이유로 전전한다면, 과연 그 사건은 잘 해결될 수 있을까요?
그전에 변호사들의 퇴사가 잦은 로펌은 과연 좋은 로펌일까요?
법무법인 여온에는 재배당이 없습니다.
우리 회사 모든 변호사는 우리 회사의 지분을 소유한 '대표'이기 때문입니다.
끝까지 여러분의 사건에 '무한한 책임'을 지겠습니다.`,
  },
  {
    question: 'Q. 내 사건을 변호사가 아니라 사무장이 처리하는거 아니야?',
    answer: `왜 값비싼 수임료를 지불하고 ‘변호사’에게 사건을 맡기시나요?
당연히 공인된 법률 전문가, 곧 변호사가 ‘직접’ 당신의 사건을 해결해주리라 믿기 때문이죠.
만약 상담할 때만 변호사지 실제 사건은 사무장(통칭 변호사 자격 없이 변호사 사무실에서 변호사가 해야 할 일을 대신하는 일반인)이 처리할 때도 그 수임료 그대로 내시겠습니까?
하지만 법률업계는 위와 같은 관례가 상당합니다.
그럴 수밖에 없는 이유는 ‘단가’ 때문인데요(이 부분은 칼럼난에서 상세히 다루겠습니다).
당신은 인생이 걸린 중요한 사건을 변호사가 아닌 ‘일반인’에게 맡기고 싶으신가요?
그리고 그 대가로 고액의 수임료를 지급할 의향이 있으신가요?
법무법인 여온은 사무장이 없습니다.
형편상 사무장을 두지 않는 것이 아니라 원칙적으로 사무장을 두지 않습니다.
당신의 사건은 유영규, 김환섭, 홍기웅 변호사가 상담부터 해결까지 ‘직접’ 합니다.`,
  },
  {
    question: 'Q. 법률상담을 받으면 반드시 사건을 맡겨야 하지 않을까?',
    answer:
      '아닙니다. 상담은 사건을 진단하기 위한 최초의 행위입니다. 따라서 법률상담을 하였다고, 반드시 그 자리에서 사건을 맡기실 필요가 없습니다. 오히려 여온은 당신이 다른 변호사와도 충분한 상담을 받아보길 권합니다. 그래야 법무법인 여온이 얼마나 뛰어난지 체감할 수 있고, 당신의 선택에 후회가 없으니까요.',
  },
  {
    question: 'Q. 수임료가 너무 비싸지 않을까?',
    answer:
      '여온의 수임료는 결코 싸지 않습니다. 당장 수임만을 목적으로 저렴한 수임료를 제안하기 보다 우리의 가치를 믿는 의뢰인에게 최선의 서비스를 제공하기 위한 적정 수임료를 제안합니다. 다만, 적정 수임료는 예상 소요 시간, 사건 난이도 보다 당신의 사정을 최우선으로 고려하여 결정합니다. 그러니 너무 가슴 졸이며 혼자 고민 마시고, 지금 전화 주세요.',
  },
  {
    question: 'Q. 수임만 하고 사건 진행을 대충하면 어쩌지?',
    answer:
      "여온에게 수임료는 '빚' 입니다. 사건이 모두 마무리되고, 당신에게 “감사합니다＂라는 말을 듣기 전까지는. 그래서 만약, 우리의 약속(핵심가치 3가지)이 지켜지지 않는다면, 받은 수임료는 모두 돌려드리겠습니다. 그리고 명심하세요. 처음 상담한 변호사와 사건을 진행하는 변호사가 다른 법무법인는 피하는게 좋습니다!",
  },
] as const;

export const THREE_REASONS_TITLE = '여온을 찾는 3가지 이유';

export type ReasonIconId = 'monthlyLimit' | 'guide' | 'strategy';

export type ReasonCard = {
  title: string;
  body: string;
  iconId: ReasonIconId;
};

export const THREE_REASONS_CARDS: readonly ReasonCard[] = [
  {
    title: '월 수임건수 제한',
    body: '고객에게 더 집중하기 위해 법무법인\n여온은 월 수임건수를 제한합니다. 그렇기에\n조기에 월 수임건수가 마감 될 수 있습니다.',
    iconId: 'monthlyLimit',
  },
  {
    title: '여정을 함께할 가이드',
    body: '여온은 당신의 휼룽한 여행가이드입니다.\n부담스럽지 않은 방법으로, 쉽고 빠르게\n여행을 마칠 수 있는 방법을\n찾아드리겠습니다.',
    iconId: 'guide',
  },
  {
    title: '사건별 맞춤 전략',
    body: '똑같은 사건은 없습니다.\n여온은 각자의 상황에 맞는\n진짜 전략을 만듭니다.',
    iconId: 'strategy',
  },
] as const;

export const PROCESS_LABEL = 'PROCESS';
export const PROCESS_TITLE = '문제는 여행이다';
export const PROCESS_IMAGE_DESKTOP = '/img/d78d6f721b046.webp';
export const PROCESS_IMAGE_MOBILE = '/img/ccb7c650f7444.webp';

export const SOCIAL_LINKS = [
  { label: 'Blog', href: 'https://blog.naver.com/lawfirmonly', external: true },
  { label: 'YouTube', href: 'https://www.youtube.com/@YeoonLaw', external: true },
  { label: 'Instagram', href: 'https://www.instagram.com/yeoonlaw', external: true },
] as const;
