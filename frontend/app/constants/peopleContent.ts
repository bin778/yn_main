/**
 * People list (`/people`) and detail (`/people/[id]`) from legacy
 * `www/people.php` (L30320–30588) and `www/peoples.php` (L17894–18867).
 */

export type PersonId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export type PersonCategory = 'expert' | 'staff';

export type ListTheme = 'light' | 'dark';

export type ImageSide = 'left' | 'right';

export type PersonDetailContent = {
  headline?: string;
  introQuote?: string;
  introParagraphs?: readonly string[];
  educationLines?: readonly string[];
  careerLines?: readonly string[];
};

export type PersonProfile = {
  id: PersonId;
  category: PersonCategory;
  name: string;
  role: string;
  email?: string;
  listPortraitDesktop: string;
  listPortraitMobile: string;
  detailHeroBgSrc: string;
  listTheme: ListTheme;
  imageSide: ImageSide;
  listCareerLines: readonly string[];
  detail: PersonDetailContent;
};

export const PEOPLE_PAGE_TITLE = '여온의 사람들';
export const PEOPLE_PAGE_DESCRIPTION = '법무법인 여온의 대표변호사, 변호사, 고문, 운영진을 소개합니다.';

export const PEOPLE_HERO = {
  title: PEOPLE_PAGE_TITLE,
  subtitle: '법무법인 여온과 함께라면 당신의 문제는 여행이 됩니다.',
  bgSrc: '/img/d7676ac934abe.webp',
} as const;

export const EXPERTS_SECTION_TITLE = '여온 전문가';
export const STAFF_SECTION_TITLE = '여온 운영진';

export const PEOPLE_IDS: readonly PersonId[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const PEOPLE: readonly PersonProfile[] = [
  {
    id: '1',
    category: 'expert',
    name: '유영규',
    role: '대표변호사',
    email: 'yooyoungkyu@yeoon.co.kr',
    listPortraitDesktop: '/img/lawyer1.webp',
    listPortraitMobile: '/img/f4623cf40765b.webp',
    detailHeroBgSrc: '/img/bf3d84d25bdb5.webp',
    listTheme: 'light',
    imageSide: 'left',
    listCareerLines: [
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
      '現 사단법인 나섬공동체 자문변호사',
      '現 서울북부교육지원청 학교폭력심의위원회 위원',
      '現 한국애견연맹 법률규정심의위원회 위원',
      '現 재한몽골인협회 자문변호사',
      '現 삼양화학 자문변호사',
      '現 나라스페이스 사외이사',
      '現 호주시드니상공회의소 정회원',
      '前 서울장위초등학교 자문변호사',
      '前 서울오봉초등학교 자문변호사',
    ],
    detail: {
      headline: "유영규 변호사는 말 못하고 고독한 당신의 술잔을 채워주는 '바텐더' 입니다.",
      introParagraphs: [
        '바를 찾는 사람들은 긴 바 테이블을 사이에 두고, 누구에게도 말할 수 없는 비밀을 바텐더에게 털어놓습니다.',
        '변호사 사무실을 찾는 사람들도 다르지 않습니다.',
        '바텐더는 손님 이름을 먹다 남은 술병에 적어 벽에 진열하고, 변호사는 의뢰인 이름을 커다란 봉투에 붙여 책장에 꽂아 놓습니다.',
        "어쩌면, 벽에 진열된 술병이 많으면 많을수록, 책장에 꽂힌 서류봉투가 많으면 많을수록 '잘 나가는' 바텐더나 변호사일지 모릅니다.",
        "그래도 모름지기 '좋은 바텐더'는 손님의 고민만큼 비워버린 술잔을 채우고, 다시 그 술잔이 비워지길 기다려주는 사람이 아닐까요.",
        '저는 사건봉투로 벽장을 채우기보다 당신의 빈 술잔을 채워주는 바텐더이고 싶습니다.',
      ],
      educationLines: ['고려대학교 사회학 학사', '전남대학교 법학전문대학원 석사', '공군 중위 전역'],
      careerLines: [
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
        '現 사단법인 나섬공동체 자문변호사',
        '現 서울북부교육지원청 학교폭력심의위원회 위원',
        '現 한국애견연맹 법률규정심의위원회 위원',
        '現 재한몽골인협회 자문변호사',
        '現 삼양화학 자문변호사',
        '現 나라스페이스 사외이사',
        '前 서울장위초등학교 자문변호사',
        '前 서울오봉초등학교 자문변호사',
      ],
    },
  },
  {
    id: '2',
    category: 'expert',
    name: '김환섭',
    role: '변호사',
    email: 'kimhwansob@yeoon.co.kr',
    listPortraitDesktop: '/img/lawyer2.webp',
    listPortraitMobile: '/img/8cff3cf652234.webp',
    detailHeroBgSrc: '/img/acbe79b659f70.webp',
    listTheme: 'dark',
    imageSide: 'right',
    listCareerLines: [
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
    detail: {
      headline: '김환섭 변호사는 당신을 지키기 위해서 "전투적인 집중력"과 "성실함"으로 무장한 "전투개미"입니다.',
      educationLines: [
        '단국대학교 법학과 학사',
        '육군 중위(헌병) 전역',
        '고려대학교 일반대학원 법학과 형사법 전공 석사과정이수',
        '원광대학교 법학전문대학원 석사',
      ],
      careerLines: [
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
    },
  },
  {
    id: '3',
    category: 'expert',
    name: '홍기웅',
    role: '변호사',
    email: 'hongkiwoong@yeoon.co.kr',
    listPortraitDesktop: '/img/lawyer3.webp',
    listPortraitMobile: '/img/ce9ae041ed451.webp',
    detailHeroBgSrc: '/img/b9ed034745fb2.webp',
    listTheme: 'light',
    imageSide: 'left',
    listCareerLines: [
      '現 서울시 공익변호사',
      '現 서울북부지원교육청 교권심사위원회 위원',
      '前 주식회사 제노레이 자문변호사',
      '前 주식회사 신화콘텍 자문변호사',
      '前 주식회사 선텍 자문변호사',
      '前 성동패션봉제인연합회 자문변호사',
      '前 주식회사 승신건설 자문변호사',
      '前 주식회사 진성해운 자문변호사',
    ],
    detail: {
      headline:
        '홍기웅 변호사는 "불도저"입니다. 길이 보이지 않는 사건도 깊이 있는 연구와 참신한 아이디어로 끝까지 밀어붙여 길을 만들어냅니다.',
      educationLines: ['단국대학교 법학과', '전남대학교 법학전문대학원 석사'],
      careerLines: [
        '現 서울시 공익변호사',
        '現 서울북부지원교육청 교권심사위원회 위원',
        '前 주식회사 제노레이 자문변호사',
        '前 주식회사 신화콘텍 자문변호사',
        '前 주식회사 선텍 자문변호사',
        '前 성동패션봉제인연합회 자문변호사',
        '前 주식회사 승신건설 자문변호사',
        '前 주식회사 진성해운 자문변호사',
      ],
    },
  },
  {
    id: '4',
    category: 'expert',
    name: '김선호',
    role: '변호사',
    email: 'kimsunho@yeoon.co.kr',
    listPortraitDesktop: '/img/lawyer4.webp',
    listPortraitMobile: '/img/kimsunho02.webp',
    detailHeroBgSrc: '/img/kimsunho.webp',
    listTheme: 'dark',
    imageSide: 'right',
    listCareerLines: [
      '대전고등법원 실무수습',
      '現 법무법인 여온 소속변호사',
      '現 서울동부교육지원청 학교폭력심의위원회 위원',
      '前 법무법인(유한) 이현 소속변호사',
    ],
    detail: {
      headline: '김선호 변호사는 당신의 이야기를 귀 기울여 듣고, 가슴 깊이 이해하는 "여행의 동반자"입니다.',
      educationLines: ['인하대학교 생명과학과 졸업', '충남대학교 법학전문대학원 졸업', '12회 변호사 시험 합격'],
      careerLines: [
        '대전고등법원 실무수습',
        '現 법무법인 여온 소속변호사',
        '現 서울동부교육지원청 학교폭력심의위원회 위원',
        '前 법무법인(유한) 이현 소속변호사',
      ],
    },
  },
  {
    id: '5',
    category: 'expert',
    name: '안성포',
    role: '고문 / 법학박사',
    listPortraitDesktop: '/img/advisory1.webp',
    listPortraitMobile: '/img/member4.webp',
    detailHeroBgSrc: '/img/member004.webp',
    listTheme: 'light',
    imageSide: 'left',
    listCareerLines: [
      '일본 동경(Tokyo)대학 법학부 객원연구원',
      '법무부 신탁법개정특별분과위원회 위원',
      '광주고등법원 조정위원',
      '대한상사중재원 중재인',
      '금융투자협회 신탁포럼 운영위원',
      '독일 하이델베르그(Heidelberg)대학 법과대학 객원교수',
      '법무부 법무자문위원회 위원',
      '한국기업법학회 회장',
      '한국신탁학회 회장',
      '한국사법학회 회장',
      '전남대학교 로스쿨 명예교수',
    ],
    detail: {
      educationLines: ['독일 Philipps-Universitaet Marburg LL.M', '독일 Philipps-Universitaet Marburg Dr. jur.'],
      careerLines: [
        '일본 동경(Tokyo)대학 법학부 객원연구원',
        '법무부 신탁법개정특별분과위원회 위원',
        '광주고등법원 조정위원',
        '대한상사중재원 중재인',
        '금융투자협회 신탁포럼 운영위원',
        '독일 하이델베르그(Heidelberg)대학 법과대학 객원교수',
        '법무부 법무자문위원회 위원',
        '한국기업법학회 회장',
        '한국신탁학회 회장',
        '한국사법학회 회장',
        '전남대학교 로스쿨 명예교수',
      ],
    },
  },
  {
    id: '6',
    category: 'staff',
    name: '정종화',
    role: '실장',
    email: 'jungjonghwa@yeoon.co.kr',
    listPortraitDesktop: '/img/member3.webp',
    listPortraitMobile: '/img/member3.webp',
    detailHeroBgSrc: '/img/member003.webp',
    listTheme: 'light',
    imageSide: 'left',
    listCareerLines: [],
    detail: {
      headline:
        '사건은 전문가와 함께, 고민은 저와 함께. 정종화 실장은 여러분과 함께 더 높이, 더 멀리 바라보는 “레츠기린”입니다.',
      introParagraphs: [
        '기린은 하루 평균 1.5시간 잠을 잡니다. 그 짧은 시간에도 서서 잠을 잡니다.',
        '렛츠기린 정종화 실장은 24시간 언제, 어디서나 당신의 고민에 귀 기울이고 있습니다.',
        '여러분의 말 못할 고충, 법률서비스 그 이상으로 법무법인 여온의 문을 지키고 있겠습니다.',
      ],
    },
  },
  {
    id: '7',
    category: 'staff',
    name: '전명균',
    role: '팀장',
    email: 'jeonmyeongkyun@reonlaw.com',
    listPortraitDesktop: '/img/member2.webp',
    listPortraitMobile: '/img/member2.webp',
    detailHeroBgSrc: '/img/member002.webp',
    listTheme: 'light',
    imageSide: 'left',
    listCareerLines: [],
    detail: {
      headline: '전명균 팀장은 당신의 시선이 향하는 곳, 그 길을 설계하는 마케터 ‘퍼플카우’입니다.',
      introParagraphs: [
        "우연한 만남마저 '정교한 필연'으로 설계하여, 당신의 발걸음이 결국 '법무법인 여온'에 닿게 만듭니다.",
      ],
    },
  },
  {
    id: '8',
    category: 'staff',
    name: '박정현',
    role: '과장',
    email: 'parkjeonghyun@yeoon.co.kr',
    listPortraitDesktop: '/img/member1.webp',
    listPortraitMobile: '/img/member1.webp',
    detailHeroBgSrc: '/img/member001.webp',
    listTheme: 'light',
    imageSide: 'left',
    listCareerLines: [],
    detail: {
      headline: "박정현 과장은 복잡한 법률 여정 속에서, 정확한 방향을 제시하는 '나침반'입니다.",
      introParagraphs: [
        '법원 등 기관의 문서를 꼼꼼히 살피고 처리하여, 의뢰인의 사건이 처음부터 끝까지 올바른 길을 갈 수 있도록 변호사님을 빈틈없이 조력하겠습니다.',
      ],
    },
  },
] as const;

export const PEOPLE_EXPERTS = PEOPLE.filter(person => person.category === 'expert');
export const PEOPLE_STAFF = PEOPLE.filter(person => person.category === 'staff');

export function isPersonId(id: string): id is PersonId {
  return PEOPLE_IDS.includes(id as PersonId);
}

export function getPersonById(id: string): PersonProfile | undefined {
  if (!isPersonId(id)) return undefined;
  return PEOPLE.find(person => person.id === id);
}

export function getPersonDetailDescription(person: PersonProfile): string {
  const { detail, listCareerLines } = person;
  if (detail.headline) return detail.headline.replace(/\s+/g, ' ').trim();
  if (listCareerLines[0]) return listCareerLines[0];
  if (detail.introParagraphs?.[0]) return detail.introParagraphs[0];
  return `${person.name} ${person.role} | 법무법인 여온`;
}
