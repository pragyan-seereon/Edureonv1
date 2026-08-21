import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function RowsPerPageSelect({ pageSize, onPageSizeChange, setPageSize }) {
  const changePageSize = onPageSizeChange || setPageSize;

  if (!changePageSize) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Rows</span>
      <Select
        value={String(pageSize)}
        onValueChange={(value) => changePageSize(Number(value))}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Footer bar: "Showing 1-8 of 8" ... page-size selector ... Previous / Page X of Y / Next
 * Drop this at the bottom of any table/card that uses usePagination().
 *
 * <PaginationBar
 *   rangeStart={rangeStart}
 *   rangeEnd={rangeEnd}
 *   totalItems={totalItems}
 *   page={page}
 *   totalPages={totalPages}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 */
export function PaginationBar({
  rangeStart,
  rangeEnd,
  totalItems,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  // Accept usePagination()'s native return names too, so callers can safely
  // spread the hook result into this component.
  setPage,
  setPageSize,
  showPageSize = true,
  itemLabel = "items",
}) {
  const changePage = onPageChange || setPage;
  const changePageSize = onPageSizeChange || setPageSize;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-3">
      <div className="text-xs text-muted-foreground">
        {totalItems === 0
          ? `No ${itemLabel}`
          : `Showing ${rangeStart}-${rangeEnd} of ${totalItems}`}
      </div>

      <div className="flex items-center gap-3">
        {showPageSize && (
          <RowsPerPageSelect
            pageSize={pageSize}
            onPageSizeChange={changePageSize}
          />
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => changePage?.(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => changePage?.(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
