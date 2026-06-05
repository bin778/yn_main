import { TABLE_PICKER_DEFAULT, TABLE_PICKER_MAX_COLS, TABLE_PICKER_MAX_ROWS } from './constants';
import type { TablePickerSize } from './types';

type TableInsertPickerProps = {
  size: TablePickerSize;
  withHeaderRow: boolean;
  onHover: (size: TablePickerSize) => void;
  onSelect: (size: TablePickerSize) => void;
};

export default function TableInsertPicker({ size, withHeaderRow, onHover, onSelect }: TableInsertPickerProps) {
  return (
    <div className="p-2">
      <p className="mb-2 text-center text-xs font-medium text-[#333]">
        {size.cols}열 × {size.rows}행
      </p>
      <div
        className="inline-grid gap-0.5 border border-[#ddd] p-1"
        style={{ gridTemplateColumns: `repeat(${TABLE_PICKER_MAX_COLS}, 1fr)` }}
        onMouseLeave={() => onHover(TABLE_PICKER_DEFAULT)}
      >
        {Array.from({ length: TABLE_PICKER_MAX_ROWS }, (_, rowIndex) =>
          Array.from({ length: TABLE_PICKER_MAX_COLS }, (_, colIndex) => {
            const row = rowIndex + 1;
            const col = colIndex + 1;
            const selected = row <= size.rows && col <= size.cols;
            const isHeaderCell = withHeaderRow && row === 1 && selected;

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                title={`${col}열 × ${row}행`}
                aria-label={`${col}열 ${row}행 표 삽입`}
                className={`h-4 w-4 border border-[#ccc] transition-colors ${
                  selected ? (isHeaderCell ? 'bg-[#e9ecef]' : 'bg-[#c5d4f0]') : 'bg-white hover:bg-[#f0f4fa]'
                }`}
                onMouseEnter={() => onHover({ rows: row, cols: col })}
                onClick={() => onSelect({ rows: row, cols: col })}
              />
            );
          }),
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-[#999]">칸에 마우스를 올려 크기를 선택하세요</p>
    </div>
  );
}
