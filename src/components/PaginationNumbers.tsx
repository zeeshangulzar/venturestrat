import React from 'react';

type PaginationNumbersProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEdges?: boolean; // show first/last always
  maxButtons?: number; // how many number buttons to show (excluding Prev/Next)
};

function buildPageRange(current: number, total: number, maxButtons: number, showEdges: boolean) {
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | '...')[] = [];
  const sideCount = Math.max(1, Math.floor((maxButtons - 3) / 2)); // space around current
  const left = Math.max(2, current - sideCount);
  const right = Math.min(total - 1, current + sideCount);

  if (showEdges) range.push(1);
  if (left > 2) range.push('...');

  for (let i = left; i <= right; i++) range.push(i);

  if (right < total - 1) range.push('...');
  if (showEdges) range.push(total);

  // If not showing edges, pad to maxButtons:
  if (!showEdges) {
    const numbers = range.filter((x) => x !== '...') as number[];
    while (numbers.length < maxButtons) {
      const first = numbers[0];
      const last = numbers[numbers.length - 1];
      if (first > 1) numbers.unshift(first - 1);
      else if (last < total) numbers.push(last + 1);
      else break;
    }
    return numbers;
  }

  return range;
}

const PaginationNumbers: React.FC<PaginationNumbersProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showEdges = true,
  maxButtons = 7,
}) => {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages, maxButtons, showEdges);

  const goPrev = () => onPageChange(Math.max(1, currentPage - 1));
  const goNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3">
      {/* Prev */}
      <button
        type="button"
        onClick={goPrev}
        disabled={currentPage <= 1}
        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
          currentPage <= 1 ? 'cursor-not-allowed opacity-40' : 'bg-white hover:bg-slate-50'
        }`}
        aria-label="Previous page"
      >
        &lt;
      </button>

      {/* Numbered */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] rounded-md border px-3 py-1.5 text-sm transition-colors ${
                p === currentPage
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50'
              }`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={goNext}
        disabled={currentPage >= totalPages}
        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
          currentPage >= totalPages ? 'cursor-not-allowed opacity-40' : 'bg-white hover:bg-slate-50'
        }`}
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationNumbers;
