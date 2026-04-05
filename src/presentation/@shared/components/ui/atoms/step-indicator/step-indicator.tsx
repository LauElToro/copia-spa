import React from 'react';
import { Box } from '@mui/material';

export interface StepIndicatorProps {
  steps: Array<{ id: string; label: string }>;
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  isStepComplete?: (stepIndex: number) => boolean;
  isStepIncomplete?: (stepIndex: number) => boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  isStepComplete,
  isStepIncomplete,
}) => {
  return (
    <Box
      sx={{
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      {steps.map((step, index) => {
        const isComplete = isStepComplete?.(index) ?? false;
        const isIncomplete = isStepIncomplete?.(index) ?? false;
        const isActive = index === currentStep;

        return (
          <Box key={step.id}>
            <Box
              onClick={() => onStepClick?.(index)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: onStepClick ? 'pointer' : 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: isActive ? 40 : 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: isComplete || isActive
                    ? '#34d399'
                    : isIncomplete
                    ? 'rgba(52, 211, 153, 0.5)'
                    : 'rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  boxShadow: isActive ? '0 0 12px rgba(52, 211, 153, 0.5)' : 'none',
                  '&:hover': {
                    backgroundColor: isComplete || isActive
                      ? '#22c55e'
                      : 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.1)',
                  },
                }}
              />
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 24,
                    height: 2,
                    backgroundColor: index < currentStep || isComplete
                      ? '#34d399'
                      : 'rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    mx: 0.5,
                    borderRadius: 1,
                  }}
                />
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

