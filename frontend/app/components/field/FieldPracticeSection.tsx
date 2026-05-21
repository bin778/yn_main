import FieldPracticeRow from '@/app/components/field/FieldPracticeRow';
import { FIELD_PRACTICES } from '@/app/constants/fieldContent';

export default function FieldPracticeSection() {
  const lastIndex = FIELD_PRACTICES.length - 1;

  return (
    <section aria-label="업무분야">
      {FIELD_PRACTICES.map((practice, index) => (
        <FieldPracticeRow key={practice.id} practice={practice} isLast={index === lastIndex} />
      ))}
    </section>
  );
}
