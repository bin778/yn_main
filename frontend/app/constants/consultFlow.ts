export type ConsultQuestionId =
  | 'topic'
  | 'region'
  | 'prior'
  | 'age'
  | 'stage'
  | 'married'
  | 'years'
  | 'children'
  | 'reason';

export type ConsultAnswers = Partial<Record<ConsultQuestionId, string>>;

export type ConsultQuestion = {
  id: ConsultQuestionId;
  label: string;
  question: string;
  options: string[];
};

export const CONSULT_TOPICS = {
  DRUNK_DRIVING: '음주운전',
  SEXUAL_ASSAULT: '성범죄·강제추행',
  DRUG: '마약',
  FAMILY: '이혼·가사',
  OTHER: '그 외 형사·민사',
} as const;

export type ConsultTopic = (typeof CONSULT_TOPICS)[keyof typeof CONSULT_TOPICS];

export const CONSULT_TOPIC_QUESTION: ConsultQuestion = {
  id: 'topic',
  label: '사건',
  question: '어떤 상담이 필요하신가요?',
  options: [
    CONSULT_TOPICS.DRUNK_DRIVING,
    CONSULT_TOPICS.SEXUAL_ASSAULT,
    CONSULT_TOPICS.DRUG,
    CONSULT_TOPICS.FAMILY,
    CONSULT_TOPICS.OTHER,
  ],
};

const CONSULT_SITUATION_FOLLOW_UPS: ConsultQuestion[] = [
  {
    id: 'stage',
    label: '상황',
    question: '지금 어떤 상황이신가요?',
    options: ['고소·신고 전', '경찰 조사 전', '경찰 조사 후', '모르겠어요'],
  },
];

const FAMILY_MARRIED_OPTIONS = {
  yes: '네, 했습니다.',
  no: '아니요. 안했습니다.',
} as const;

const FAMILY_COMMON_LAW_YEARS_QUESTION: ConsultQuestion = {
  id: 'years',
  label: '사실혼',
  question: '사실혼 몇 년 차이신가요?',
  options: ['1년 미만', '1~5년', '5~10년', '10년 이상'],
};

const FAMILY_MARRIAGE_YEARS_QUESTION: ConsultQuestion = {
  id: 'years',
  label: '기간',
  question: '결혼 몇 년 차이신가요?',
  options: ['1년 미만', '1~5년', '5~10년', '10년 이상'],
};

const FAMILY_CHILDREN_QUESTION: ConsultQuestion = {
  id: 'children',
  label: '자녀',
  question: '자녀가 있으신가요?',
  options: ['무자녀', '1명', '2명', '3명 이상'],
};

const FAMILY_REASON_QUESTION: ConsultQuestion = {
  id: 'reason',
  label: '사유',
  question: '사유는 무엇인가요?',
  options: ['배우자 유책', '성격차이', '기타'],
};

/** 사건별 후속 질문. 빈 배열이면 사건 선택 후 바로 연락처로 간다. */
export const CONSULT_BRANCHES: Record<ConsultTopic, ConsultQuestion[]> = {
  [CONSULT_TOPICS.DRUNK_DRIVING]: [
    {
      id: 'region',
      label: '지역',
      question: '음주 발생 지역은 어딘가요?',
      options: ['서울', '경기·인천', '지방', '제주'],
    },
    {
      id: 'prior',
      label: '전력',
      question: '음주 전력이 있으신가요?',
      options: ['초범', '재범', '3회차', '4회차 이상'],
    },
    {
      id: 'age',
      label: '연령',
      question: '연령대가 어떻게 되시나요?',
      options: ['20~30대', '30~40대', '40~50대', '50대 이상'],
    },
  ],
  [CONSULT_TOPICS.SEXUAL_ASSAULT]: CONSULT_SITUATION_FOLLOW_UPS,
  [CONSULT_TOPICS.DRUG]: CONSULT_SITUATION_FOLLOW_UPS,
  [CONSULT_TOPICS.FAMILY]: [
    {
      id: 'married',
      label: '혼인',
      question: '혼인 신고를 하셨나요?',
      options: [FAMILY_MARRIED_OPTIONS.yes, FAMILY_MARRIED_OPTIONS.no],
    },
    FAMILY_MARRIAGE_YEARS_QUESTION,
    FAMILY_CHILDREN_QUESTION,
    FAMILY_REASON_QUESTION,
  ],
  [CONSULT_TOPICS.OTHER]: [],
};

export const CONSULT_CHAT_INFLOW = {
  desktop: '챗봇 상담(PC)',
  mobile: '챗봇 상담(Mobile)',
} as const;

function isConsultTopic(value: string | undefined): value is ConsultTopic {
  if (!value) return false;
  return (Object.values(CONSULT_TOPICS) as string[]).includes(value);
}

export function getConsultPath(answers: ConsultAnswers): ConsultQuestion[] {
  const topic = answers.topic;
  if (!isConsultTopic(topic)) {
    return [CONSULT_TOPIC_QUESTION];
  }

  if (topic === CONSULT_TOPICS.FAMILY) {
    const yearsQuestion =
      answers.married === FAMILY_MARRIED_OPTIONS.no ? FAMILY_COMMON_LAW_YEARS_QUESTION : FAMILY_MARRIAGE_YEARS_QUESTION;

    return [
      CONSULT_TOPIC_QUESTION,
      CONSULT_BRANCHES[CONSULT_TOPICS.FAMILY][0],
      yearsQuestion,
      FAMILY_CHILDREN_QUESTION,
      FAMILY_REASON_QUESTION,
    ];
  }

  const followUps = CONSULT_BRANCHES[topic];
  return [CONSULT_TOPIC_QUESTION, ...followUps];
}

export function getConsultTotalSteps(answers: ConsultAnswers): number {
  return getConsultPath(answers).length + 1;
}

/** 현재 단계까지의 답만 남긴다. 사건 변경 시 다른 분기 답이 섞이지 않게 한다. */
export function answersThroughStep(
  answers: ConsultAnswers,
  path: ConsultQuestion[],
  stepIndex: number,
): ConsultAnswers {
  const kept: ConsultAnswers = {};
  const lastIndex = Math.min(stepIndex, path.length - 1);

  for (let index = 0; index <= lastIndex; index += 1) {
    const question = path[index];
    const value = answers[question.id];
    if (value) kept[question.id] = value;
  }

  return kept;
}

export function formatConsultContent(answers: ConsultAnswers): string {
  return getConsultPath(answers)
    .map(question => `${question.label}: ${answers[question.id] ?? ''}`)
    .join('\n');
}
