"use client";

import React from "react";
import { Box, IconButton, SxProps, Theme } from "@mui/material";
import { ChevronLeft, ChevronRight, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight } from "@mui/icons-material";
import { PaginationProps } from "./types";
import { defaultTheme } from "./theme";

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = "",
  theme = defaultTheme,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const buttonBaseStyles = {
    ...theme.button,
    minWidth: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const activeButtonStyles: SxProps<Theme> = {
    ...buttonBaseStyles,
    ...theme.activeButton,
  } as SxProps<Theme>;

  const inactiveButtonStyles: SxProps<Theme> = {
    ...buttonBaseStyles,
  } as SxProps<Theme>;

  return (
    <Box
      component="nav"
      className={`pagination ${className}`}
      sx={theme.container}
    >
      {showFirstLast && (
        <IconButton
          onClick={(e) => handlePageChange(e, 1)}
          disabled={currentPage === 1}
          sx={inactiveButtonStyles}
          aria-label="First page"
          size="small"
          type="button"
        >
          <KeyboardDoubleArrowLeft sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      <IconButton
        onClick={(e) => handlePageChange(e, currentPage - 1)}
        disabled={currentPage === 1}
        sx={inactiveButtonStyles}
        aria-label="Previous page"
        size="small"
        type="button"
      >
        <ChevronLeft sx={{ fontSize: 18 }} />
      </IconButton>

      {getPageNumbers().map((page, index, array) => {
        if (page === "...") {
          const prevPage = array[index - 1];
          const nextPage = array[index + 1];
          const ellipsisKey = `ellipsis-${prevPage}-${nextPage}`;
          return (
            <Box
              key={ellipsisKey}
              sx={theme.ellipsis}
            >
              ...
            </Box>
          );
        }

        const isActive = currentPage === page;
        return (
          <IconButton
            key={page}
            onClick={(e) => handlePageChange(e, page as number)}
            sx={isActive ? activeButtonStyles : inactiveButtonStyles}
            aria-label={`Go to page ${page}`}
            aria-current={isActive ? 'page' : undefined}
            size="small"
            type="button"
          >
            {page}
          </IconButton>
        );
      })}

      <IconButton
        onClick={(e) => handlePageChange(e, currentPage + 1)}
        disabled={currentPage === totalPages}
        sx={inactiveButtonStyles}
        aria-label="Next page"
        size="small"
        type="button"
      >
        <ChevronRight sx={{ fontSize: 18 }} />
      </IconButton>

      {showFirstLast && (
        <IconButton
          onClick={(e) => handlePageChange(e, totalPages)}
          disabled={currentPage === totalPages}
          sx={inactiveButtonStyles}
          aria-label="Last page"
          size="small"
          type="button"
        >
          <KeyboardDoubleArrowRight sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
};
