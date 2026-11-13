import Image from 'next/image';
import type { ReactNode } from 'react';

import type { ConsultInsight, ConsultInsightLawyer } from '@/app/constants/consultInsights';

const AVATAR_SIZE = 36;

function BotAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
  );
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1" aria-label="입력 중">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
    </div>
  );
}

export function LawyerHeader({ lawyer }: { lawyer: ConsultInsightLawyer }) {
  return (
    <p className="text-xs font-semibold text-gray-500">
      {lawyer.name} {lawyer.title}
      <span className="mt-0.5 ml-1 font-medium text-gray-400">· {lawyer.specialty}</span>
    </p>
  );
}

export function BotMessage({
  avatarSrc,
  lawyerName,
  children,
}: {
  avatarSrc: string;
  lawyerName: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <BotAvatar src={avatarSrc} name={lawyerName} />
      <div className="min-w-0 rounded-2xl rounded-tl-md bg-[#f3f5f9] px-3 py-2.5">{children}</div>
    </div>
  );
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#023373] px-3 py-2 text-sm break-keep text-white">
        {text}
      </p>
    </div>
  );
}

export function QuestionTurn({
  question,
  selected,
  insight,
  lawyer,
}: {
  question: string;
  selected: string;
  insight: ConsultInsight | null;
  lawyer: ConsultInsightLawyer;
}) {
  return (
    <>
      <BotMessage avatarSrc={lawyer.avatarSrc} lawyerName={lawyer.name}>
        <p className="break-keep text-sm leading-relaxed font-medium text-[#023373]">{question}</p>
      </BotMessage>
      <UserMessage text={selected} />
      {insight && (
        <BotMessage avatarSrc={insight.lawyer.avatarSrc} lawyerName={insight.lawyer.name}>
          <LawyerHeader lawyer={insight.lawyer} />
          <p className="mt-1 break-keep text-sm leading-relaxed text-gray-800">{insight.message}</p>
        </BotMessage>
      )}
    </>
  );
}
