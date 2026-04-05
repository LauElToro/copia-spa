import { SxProps, Theme } from "@mui/material";

export interface PaginationTheme {
  container: SxProps<Theme>;
  button: SxProps<Theme>;
  activeButton: SxProps<Theme>;
  ellipsis: SxProps<Theme>;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme?: PaginationTheme; // Deprecated, kept for backward compatibility
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}
