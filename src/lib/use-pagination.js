import { useMemo, useState, useEffect } from "react";

/**
 * Generic client-side pagination hook.
 *
 * const { page, pageSize, setPage, setPageSize, pageItems, totalItems, totalPages } =
 *   usePagination(filteredRows, 10);
 *
 * - Resets to page 1 whenever the input array (rows) changes length/identity
 *   (e.g. after a filter/search), so you never get stuck on an empty page.
 * - Clamps `page` if pageSize changes and pushes page out of range.
 */
export function usePagination(rows, initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 when the underlying data set changes (search/filter/tab switch)
  useEffect(() => {
    setPage(1);
  }, [rows]);

  // Clamp page if pageSize changes and current page is now out of range
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [pageSize, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return {
    page,
    pageSize,
    setPage,
    setPageSize: (n) => {
      setPageSize(n);
      setPage(1);
    },
    pageItems,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
  };
}
