import Image from 'next/image';

import type { FieldPractice } from '@/app/constants/fieldContent';

type FieldPracticeRowProps = {
  practice: FieldPractice;
  isLast?: boolean;
};

function TopicList({ topics }: { topics: readonly string[] }) {
  return (
    <ul className="space-y-0 text-[15px] md:text-[17px] tracking-[-0.2px] text-black">
      {topics.map(topic => (
        <li key={topic}>▶ {topic}</li>
      ))}
    </ul>
  );
}

export default function FieldPracticeRow({ practice, isLast = false }: FieldPracticeRowProps) {
  const allTopics = [...practice.topicColumns[0], ...practice.topicColumns[1]];

  return (
    <article
      className={`bg-white px-6 ${isLast ? 'pb-24 md:pb-[120px]' : ''}`}
      aria-label={practice.topicColumns[0][0]}
    >
      <div className={`mx-auto max-w-[960px] border-b border-[#555] py-[30px] md:py-[40px] ${isLast ? 'md:mb-0' : ''}`}>
        <div className="md:grid md:grid-cols-[minmax(0,20%)_1fr] md:gap-6">
          <div className="mb-6 md:mb-0 md:pt-4">
            <Image
              src={practice.iconSrc}
              alt=""
              width={100}
              height={100}
              className="h-auto max-w-[80px] md:max-w-[100px]"
            />
          </div>

          <div className="md:col-span-1">
            <div className="hidden gap-8 md:grid md:grid-cols-2">
              <TopicList topics={practice.topicColumns[0]} />
              <TopicList topics={practice.topicColumns[1]} />
            </div>
            <div className="md:hidden">
              <TopicList topics={allTopics} />
            </div>

            <div className="mt-4 space-y-1 md:space-y-2 md:mt-0 md:py-8 md:py-[20px]">
              {practice.paragraphs.map(paragraph => (
                <p key={paragraph} className="text-[15px] md:text-[17px] leading-relaxed tracking-[-0.2px] text-[#555]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
