export type ConsultQuestionId = 'topic' | 'stage' | 'contactTime';

export type ConsultAnswers = Partial<Record<ConsultQuestionId, string>>;

export type ConsultQuestion = {
  id: ConsultQuestionId;
  label: string;
  question: string;
  options: string[];
};

export const CONSULT_QUESTIONS: ConsultQuestion[] = [
  {
    id: 'topic',
    label: '사건',
    question: '어떤 상담이 필요하신가요?',
    options: ['음주운전', '성범죄·강제추행', '마약', '이혼·가사', '그 외 형사·민사'],
  },
  {
    id: 'stage',
    label: '단계',
    question: '지금 어느 단계인가요?',
    options: ['상담만 필요해요', '경찰 조사·출석 예정', '검찰·재판 진행 중', '잘 모르겠어요'],
  },
  {
    id: 'contactTime',
    label: '연락',
    question: '연락은 언제가 좋으신가요?',
    options: ['지금 바로', '오늘 중', '여유 있어요'],
  },
];

export const CONSULT_CONTACT_STEP = CONSULT_QUESTIONS.length;
export const CONSULT_TOTAL_STEPS = CONSULT_QUESTIONS.length + 1;

export const CONSULT_CHAT_INFLOW = {
  desktop: '챗봇 상담(PC)',
  mobile: '챗봇 상담(Mobile)',
} as const;

export function formatConsultContent(answers: ConsultAnswers): string {
  return CONSULT_QUESTIONS.map(question => `${question.label}: ${answers[question.id] ?? ''}`).join('\n');
}
