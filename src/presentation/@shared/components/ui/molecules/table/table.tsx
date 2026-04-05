import React, { ReactNode } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  TableProps as MuiTableProps,
} from '@mui/material';

export interface TableProps {
  children: ReactNode;
  className?: string;
  sx?: MuiTableProps['sx'];
}

export interface TableRowProps {
  children: ReactNode;
  className?: string;
  sx?: MuiTableProps['sx'];
}

export interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'justify';
  colSpan?: number;
  className?: string;
  sx?: MuiTableProps['sx'];
}

export const Table: React.FC<TableProps> = ({ children, className = '', sx }) => {
  return (
    <MuiTable className={className} sx={sx}>
      {children}
    </MuiTable>
  );
};

export const TableHeadComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <TableHead>{children}</TableHead>;
};

export const TableBodyComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <TableBody>{children}</TableBody>;
};

export const TableFooterComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <TableFooter>{children}</TableFooter>;
};

export const TableRowComponent: React.FC<TableRowProps> = ({ children, className = '', sx }) => {
  return (
    <TableRow className={className} sx={sx}>
      {children}
    </TableRow>
  );
};

export const TableCellComponent: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  colSpan,
  className = '',
  sx,
}) => {
  return (
    <TableCell align={align} colSpan={colSpan} className={className} sx={sx}>
      {children}
    </TableCell>
  );
};

export const TableContainerComponent: React.FC<{ children: ReactNode; sx?: MuiTableProps['sx'] }> = ({
  children,
  sx,
}) => {
  return (
    <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', ...sx }}>
      {children}
    </TableContainer>
  );
};

