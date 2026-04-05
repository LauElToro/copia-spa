import React, { ReactNode } from 'react';
import { Stack as MuiStack, StackProps as MuiStackProps } from '@mui/material';

export interface StackProps extends Omit<MuiStackProps, 'children'> {
  children: ReactNode;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export const Stack: React.FC<StackProps> = ({
  children,
  textAlign,
  sx,
  ...props
}) => {
  return (
    <MuiStack
      {...props}
      sx={{
        textAlign,
        ...sx,
      }}
    >
      {children}
    </MuiStack>
  );
};

