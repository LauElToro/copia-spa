import React, { ReactNode } from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps } from '@mui/material';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

export interface AlertProps {
  severity?: AlertSeverity;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  sx?: MuiAlertProps['sx'];
}

export const Alert: React.FC<AlertProps> = ({
  severity = 'info',
  children,
  onClose,
  className = '',
  sx,
}) => {
  return (
    <MuiAlert
      severity={severity}
      onClose={onClose}
      className={className}
      sx={{
        backgroundColor: severity === 'error' ? '#d32f2f' : 
                        severity === 'warning' ? '#ed6c02' :
                        severity === 'success' ? '#2e7d32' :
                        '#0288d1',
        color: '#fff',
        '& .MuiAlert-icon': {
          color: '#fff',
        },
        ...sx,
      }}
    >
      {children}
    </MuiAlert>
  );
};

