export type ConsultQuestionId = 'topic' | 'priority' | 'status';

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
  ECONOMIC_CRIME: '경제범죄·사기',
  REAL_ESTATE: '부동산',
  FAMILY: '이혼·가사',
  CORPORATE: '기업자문',
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
    CONSULT_TOPICS.ECONOMIC_CRIME,
    CONSULT_TOPICS.REAL_ESTATE,
    CONSULT_TOPICS.FAMILY,
    CONSULT_TOPICS.CORPORATE,
    CONSULT_TOPICS.OTHER,
  ],
};

const FAMILY_PRIORITY_QUESTION: ConsultQuestion = {
  id: 'priority',
  label: '우선 고려',
  question: '이혼을 본격적으로 고민하거나 준비하시면서 현재 최우선으로 고려하고 계신 사항은 무엇인가요?',
  options: [
    '재산분할과 재산 보호가 가장 중요합니다.',
    '자녀의 양육권과 양육환경이 가장 중요합니다.',
    '위자료 및 법적 책임 여부를 확인하고 싶습니다.',
    '현재 상황에 대한 전반적인 검토가 필요합니다.',
  ],
};

const FAMILY_STATUS_QUESTION: ConsultQuestion = {
  id: 'status',
  label: '논의 진행',
  question: '이혼을 고려하게 된 이후 현재까지, 상대방과 주요 사항에 대한 논의는 어느 정도 진행된 상태인가요?',
  options: [
    '주요 사항에 관한 논의가 마무리되었습니다.',
    '일부 사항에 대해 논의가 이루어졌습니다.',
    '의견 차이로 논의에 진전이 없는 상태입니다.',
    '아직 논의를 시작하지 않았습니다.',
  ],
};

const CORPORATE_PRIORITY_QUESTION: ConsultQuestion = {
  id: 'priority',
  label: '시급 이슈',
  question: '기업을 운영하시면서 현재 가장 시급하게 법률 검토나 자문이 필요한 이슈는 무엇인가요?',
  options: [
    '계약서 작성 및 법률 검토 (독소조항 파악 등)',
    '인사/노무 갈등 (부당해고, 임금체불 등)',
    '경영권 방어 및 주주 간 지분 분쟁',
    '영업비밀 침해, 지식재산권, 부정경쟁',
  ],
};

const CORPORATE_STATUS_QUESTION: ConsultQuestion = {
  id: 'status',
  label: '진행 상황',
  question: '해당 이슈와 관련하여 현재 내부적, 혹은 외부적으로 어느 정도까지 진행이 되었나요?',
  options: [
    '사전 예방 차원에서 미리 법률 자문을 구하는 단계입니다.',
    '상대방(직원/거래처/주주 등)과 이견이 발생하여 조율 중입니다.',
    '내용증명 수발신 등 본격적인 법적 분쟁 조짐이 있습니다.',
    '이미 소송, 가처분, 고소 등이 제기되어 방어가 시급합니다.',
  ],
};

const ECONOMIC_CRIME_PRIORITY_QUESTION: ConsultQuestion = {
  id: 'priority',
  label: '시급 과제',
  question: '현재 사기 등 경제범죄와 관련해 가장 시급하게 해결해야 할 문제는 무엇인가요?',
  options: [
    '사기 피해를 입어 피해금 회수와 가해자 처벌이 시급합니다.',
    '억울하게 사기 혐의를 받고 있어 무죄를 입증해야 합니다.',
    '혐의를 일부 인정하며, 원만한 합의와 선처가 필요합니다.',
    '투자/동업 분쟁으로 법적 책임 소재 파악이 필요합니다.',
  ],
};

const ECONOMIC_CRIME_STATUS_QUESTION: ConsultQuestion = {
  id: 'status',
  label: '절차 진행',
  question: '현재 사건에 대한 수사나 법적 절차는 어떻게 진행되고 있나요?',
  options: [
    '아직 경찰 고소(신고) 전 단계입니다.',
    '고소장 접수 또는 경찰 조사가 진행 중입니다.',
    '검찰 송치 또는 재판으로 넘어간 상태입니다.',
    '상대방이 연락 두절되어 막막한 상태입니다.',
  ],
};

const REAL_ESTATE_PRIORITY_QUESTION: ConsultQuestion = {
  id: 'priority',
  label: '핵심 고민',
  question: '부동산 문제와 관련하여 현재 가장 큰 고민은 무엇인가요?',
  options: [
    '전세금 등 임대차 보증금을 돌려받지 못하고 있습니다.',
    '세입자가 집을 비워주지 않아 명도소송이 필요합니다.',
    '매매계약 파기나 위약금 등 계약 관련 분쟁이 발생했습니다.',
    '소유권 분쟁이나 기타 법적 조언이 필요합니다.',
  ],
};

const REAL_ESTATE_STATUS_QUESTION: ConsultQuestion = {
  id: 'status',
  label: '조치 현황',
  question: '이 문제와 관련해 상대방과 어느 정도까지 조치가 이루어졌나요?',
  options: [
    '구두나 메시지로만 연락을 시도하고 있습니다.',
    '내용증명 발송 등 공식적인 문제 제기를 마쳤습니다.',
    '가압류나 지급명령, 소송 등 법적 절차를 시작했습니다.',
    '상대방이 협조하지 않거나 회피하고 있습니다.',
  ],
};

const SEXUAL_ASSAULT_PRIORITY_QUESTION: ConsultQuestion = {
  id: 'priority',
  label: '시급 조력',
  question: '성범죄 사건과 관련하여 현재 가장 시급하게 변호사의 조력이 필요한 부분은 무엇인가요?',
  options: [
    '억울하게 혐의를 받고 있어 무혐의/무죄 입증이 시급합니다.',
    '혐의를 인정하며, 피해자 합의와 최대한의 선처가 필요합니다.',
    '성범죄 피해자로서 가해자 처벌과 피해 보상을 원합니다.',
    '사안이 주변(가족/직장)에 알려지는 것을 막고 싶습니다.',
  ],
};

const SEXUAL_ASSAULT_STATUS_QUESTION: ConsultQuestion = {
  id: 'status',
  label: '수사 진행',
  question: '현재 수사 단계나 진행 상황은 어떠한가요?',
  options: [
    '아직 경찰 신고나 조사가 이루어지지 않은 초기 상태입니다.',
    '경찰 조사를 앞두고 있거나, 방금 1차 조사를 마쳤습니다.',
    '검찰로 송치되었거나 재판을 기다리고 있는 상황입니다.',
    '피해자/가해자 측에서 연락이 오가고 있는 상황입니다.',
  ],
};

const DRUG_PRIORITY_QUESTION: ConsultQuestion = {
  id: 'priority',
  label: '핵심 쟁점',
  question: '마약 사건과 관련하여 현재 가장 핵심적인 쟁점이나 목표는 무엇인가요?',
  options: [
    '단순 투약이며, 기소유예나 집행유예 등 선처를 구합니다.',
    '소지, 운반, 매매 등의 혐의를 받아 무거운 처벌이 예상됩니다.',
    '전혀 모르는 상태에서 연루되어 억울한 상황(무혐의 주장)입니다.',
    '자수를 고민 중이거나 수사기관의 조사 연락을 막 받았습니다.',
  ],
};

const DRUG_STATUS_QUESTION: ConsultQuestion = {
  id: 'status',
  label: '수사 진행',
  question: '현재 압수수색이나 모발/소변 검사 등 수사 진행 상황은 어떠한가요?',
  options: [
    '아직 수사기관의 연락을 받지 않았으나 불안한 상태입니다.',
    '경찰의 연락을 받고 출석 일정을 조율 중입니다.',
    '압수수색을 받았거나 소변/모발 검사를 이미 진행했습니다.',
    '구속 수사를 받고 있거나 재판으로 넘어간 상태입니다.',
  ],
};

const DRUNK_PRIORITY_QUESTION: ConsultQuestion = {
  id: 'priority',
  label: '시급 과제',
  question: '현재 상황에서 가장 우려되거나 시급하게 해결해야 할 문제는 무엇인가요?',
  options: [
    '구속이나 실형 등 무거운 처벌을 피하는 것입니다.',
    '면허 취소 방지 등 행정 처분 구제입니다.',
    '직장 내 징계나 해고 등 불이익을 막는 것입니다.',
    '피해자와의 합의 진행이 가장 막막합니다.',
  ],
};

const DRUNK_STATUS_QUESTION: ConsultQuestion = {
  id: 'status',
  label: '절차 진행',
  question: '현재 수사 및 재판 절차는 어디까지 진행되셨나요?',
  options: [
    '적발 직후이며 아직 경찰 조사를 받기 전입니다.',
    '경찰 조사를 받았고, 검찰 송치를 기다리고 있습니다.',
    '이미 재판 일정이 잡혔거나 진행 중입니다.',
    '절차를 잘 몰라 전체적인 확인이 필요합니다.',
  ],
};

/** 사건별 후속 질문. 빈 배열이면 사건 선택 후 바로 연락처로 간다. */
export const CONSULT_BRANCHES: Record<ConsultTopic, ConsultQuestion[]> = {
  [CONSULT_TOPICS.FAMILY]: [FAMILY_PRIORITY_QUESTION, FAMILY_STATUS_QUESTION],
  [CONSULT_TOPICS.CORPORATE]: [CORPORATE_PRIORITY_QUESTION, CORPORATE_STATUS_QUESTION],
  [CONSULT_TOPICS.ECONOMIC_CRIME]: [ECONOMIC_CRIME_PRIORITY_QUESTION, ECONOMIC_CRIME_STATUS_QUESTION],
  [CONSULT_TOPICS.REAL_ESTATE]: [REAL_ESTATE_PRIORITY_QUESTION, REAL_ESTATE_STATUS_QUESTION],
  [CONSULT_TOPICS.SEXUAL_ASSAULT]: [SEXUAL_ASSAULT_PRIORITY_QUESTION, SEXUAL_ASSAULT_STATUS_QUESTION],
  [CONSULT_TOPICS.DRUG]: [DRUG_PRIORITY_QUESTION, DRUG_STATUS_QUESTION],
  [CONSULT_TOPICS.DRUNK_DRIVING]: [DRUNK_PRIORITY_QUESTION, DRUNK_STATUS_QUESTION],
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

  return [CONSULT_TOPIC_QUESTION, ...CONSULT_BRANCHES[topic]];
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

const EMPTY_CONSULT_CONTENT = '챗봇 바로 상담 접수';

export function formatConsultContent(answers: ConsultAnswers): string {
  const lines = getConsultPath(answers)
    .filter(question => Boolean(answers[question.id]))
    .map(question => `${question.label}: ${answers[question.id]}`);

  if (lines.length === 0) return EMPTY_CONSULT_CONTENT;
  return lines.join('\n');
}

export const CONSULT_TYPING_DELAY_MS = 320;

export const CONSULT_CHAT_COPY = {
  title: '내 상황 확인',
  greeting: '안녕하세요, 법무법인 여온입니다. 상황을 짧게 확인하거나 바로 상담을 접수해 주세요.',
  skipHint: '지금 바로 상담 연결',
  skipCta: '지금 바로 상담 연결',
  contactTitleWithAnswers: '지금까지 알려주신 상황을 함께 전달합니다. 성함과 연락처를 남겨 주세요.',
  contactTitleWithoutAnswers: '성함과 연락처를 남겨주시면 담당 변호사가 확인 후 연락드립니다.',
  contactSubmit: '상담 신청하기',
} as const;
