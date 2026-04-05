"use client";

import React from "react";
import {
  NotificationBanner,
  NotificationBannerAction,
  NotificationBannerProps,
  NotificationBannerVariant,
} from "@/presentation/@shared/components/ui/atoms/notification-banner";

export interface NotificationMessageProps {
  title: string;
  description?: string;
  variant?: NotificationBannerVariant;
  action?: NotificationBannerAction;
  className?: string;
  layout?: NotificationBannerProps["layout"];
}

export const NotificationMessage: React.FC<NotificationMessageProps> = ({
  title,
  description,
  variant = "success",
  action,
  className,
  layout = "horizontal",
}) => (
  <NotificationBanner
    title={title}
    description={description}
    variant={variant}
    action={action}
    className={className}
    layout={layout}
  />
);

export default NotificationMessage;

