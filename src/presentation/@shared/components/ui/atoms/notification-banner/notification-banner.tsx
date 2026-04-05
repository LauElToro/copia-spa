"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { Login as LoginIcon, Info as InfoIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon, Error as ErrorIcon, ArrowForward } from "@mui/icons-material";
import { Button } from "../button";
import "./notification-banner.css";

export type NotificationBannerVariant = "info" | "success" | "warning" | "danger";

export interface NotificationBannerAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface NotificationBannerProps {
  title: string;
  description?: string;
  variant?: NotificationBannerVariant;
  iconName?: string;
  icon?: React.ReactNode;
  action?: NotificationBannerAction;
  className?: string;
  layout?: "horizontal" | "vertical";
}

const variantClassMap: Record<NotificationBannerVariant, string> = {
  info: "notification-banner--info",
  success: "notification-banner--success",
  warning: "notification-banner--warning",
  danger: "notification-banner--danger",
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  title,
  description,
  variant = "info",
  icon,
  iconName,
  action,
  className = "",
  layout = "horizontal",
}) => {
  const bannerClassName = [
    "notification-banner",
    variantClassMap[variant],
    layout === "vertical" ? "notification-banner--vertical" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const getDefaultIcon = () => {
    if (icon) return icon;
    if (iconName === 'user' || iconName === 'login') {
      return <LoginIcon sx={{ fontSize: { xs: 20, md: 24 } }} />;
    }
    switch (variant) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: { xs: 20, md: 24 } }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: { xs: 20, md: 24 } }} />;
      case 'danger':
        return <ErrorIcon sx={{ fontSize: { xs: 20, md: 24 } }} />;
      default:
        return <InfoIcon sx={{ fontSize: { xs: 20, md: 24 } }} />;
    }
  };

  const isVertical = layout === "vertical";

  return (
    <Box
      className={bannerClassName}
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: isVertical ? 'column' : 'row' },
        alignItems: { xs: 'flex-start', sm: isVertical ? 'flex-start' : 'center' },
        justifyContent: 'space-between',
        gap: { xs: 2, md: 3 },
        padding: { xs: 2, md: 3 },
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
        border: '1px solid rgba(41, 196, 128, 0.1)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: 'none !important',
        filter: 'none !important',
        outline: 'none !important',
        WebkitBoxShadow: 'none !important',
        MozBoxShadow: 'none !important',
        textShadow: 'none !important',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        '&::before': {
          display: 'none !important'
        },
        '&::after': {
          display: 'none !important'
        },
        '&:hover': {
          borderColor: 'rgba(41, 196, 128, 0.4)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))',
          boxShadow: 'none !important',
          filter: 'none !important',
          outline: 'none !important',
          WebkitBoxShadow: 'none !important',
          MozBoxShadow: 'none !important',
          textShadow: 'none !important',
          '&::before': {
            display: 'none !important'
          },
          '&::after': {
            display: 'none !important'
          }
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          flex: 1,
          minWidth: 0
        }}
      >
        {getDefaultIcon() && (
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 60, md: 100 },
              height: { xs: 60, md: 100 },
              minWidth: { xs: 60, md: 100 },
              minHeight: { xs: 60, md: 100 },
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: variant === 'success'
                  ? '#29C480'
                  : variant === 'info'
                  ? '#3B82F6'
                  : variant === 'warning'
                  ? '#F59E0B'
                  : '#EF4444'
              }}
            >
              {getDefaultIcon()}
            </Box>
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            justifyContent: 'space-between'
          }}
        >
          {description && (
            <Typography
              sx={{
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.85)',
                display: '-webkit-box',
                WebkitLineClamp: { xs: 5, md: 4 },
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 0.5,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                textAlign: 'left',
                flex: '0 1 auto',
                margin: 0
              }}
            >
              {description}
            </Typography>
          )}
          <Box sx={{ mt: 'auto' }}>
            <Typography
              sx={{
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                fontWeight: 600,
                color: '#34d399',
                margin: 0,
                padding: 0,
                lineHeight: 1.3
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
      </Box>

      {action && (
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: isVertical ? '100%' : 'auto' }
          }}
        >
        <Button
          variant="success"
          size="md"
          onClick={action.onClick}
            sx={{
              width: { xs: '100%', sm: isVertical ? '100%' : 'auto' },
              minWidth: { xs: 'auto', sm: '140px' },
              px: 4,
              py: 1.5,
              backgroundColor: '#29C480 !important',
              color: '#1e293b !important',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              backgroundImage: 'none !important',
              boxShadow: 'none !important',
              textShadow: 'none !important',
              '&:hover': {
                backgroundColor: '#ffffff !important',
                color: '#000000 !important',
                backgroundImage: 'none !important',
                boxShadow: 'none !important',
                textShadow: 'none !important',
                '& .arrow-icon': {
                  transform: 'translateX(4px)'
                }
              },
              '& .MuiButton-startIcon': {
                display: 'none'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
            {action.label}
              <ArrowForward 
                className="arrow-icon"
                sx={{ 
                  fontSize: 18,
                  transition: 'transform 0.3s ease'
                }}
              />
            </Box>
        </Button>
        </Box>
      )}
    </Box>
  );
};

export default NotificationBanner;
