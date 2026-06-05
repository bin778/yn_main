import { formatScheduledDatetime } from '../../lib/boardPostTypes';

type ScheduledPostBannerProps = {
  wrDatetime: string;
  loading: boolean;
  onCancelSchedule: () => void;
};

export default function ScheduledPostBanner({ wrDatetime, loading, onCancelSchedule }: ScheduledPostBannerProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-[#d6e4f5] bg-[#eef4fb] px-4 py-3">
      <p className="text-sm text-[#1a3151]">
        <span className="font-medium">발행 예정:</span> {formatScheduledDatetime(wrDatetime)}
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={onCancelSchedule}
        className="cursor-pointer border border-[#b42318] px-3 py-1.5 text-sm text-[#b42318] hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        예약 취소
      </button>
    </div>
  );
}
