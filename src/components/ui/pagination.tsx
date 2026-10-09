"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IPaginationMeta } from "@/types";

interface PaginationProps {
  meta: IPaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({ meta, onPageChange, isLoading }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate visible page numbers with ellipsis logic
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  }

  const pageNumbers = getPageNumbers();
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {startItem}–{endItem}
            </span>{" "}
            of <span className="font-semibold text-foreground">{total}</span>{" "}
            results
          </>
        )}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={!canPrev || isLoading}
          aria-label="First page"
          id="pagination-first-btn"
        >
          <ChevronsLeft className="size-3.5" />
        </Button>

        {/* Prev */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev || isLoading}
          aria-label="Previous page"
          id="pagination-prev-btn"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5">
          {pageNumbers.map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-1.5 text-xs text-muted-foreground select-none"
              >
                ···
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => typeof p === "number" && onPageChange(p)}
                disabled={isLoading}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                id={`pagination-page-${p}-btn`}
                className="min-w-[28px] text-xs"
              >
                {p}
              </Button>
            ),
          )}
        </div>

        {/* Next */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext || isLoading}
          aria-label="Next page"
          id="pagination-next-btn"
        >
          <ChevronRight className="size-3.5" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNext || isLoading}
          aria-label="Last page"
          id="pagination-last-btn"
        >
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
