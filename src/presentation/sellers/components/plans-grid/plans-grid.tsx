"use client";

import React, { useEffect, useState } from "react";
import PlansDesktop from "./plans-desktop";
import PlansMobileNew from "./plans-mobile-new";
import { PlansGridProps, defaultPlans, defaultFeatures } from "./types";

const PlansGrid: React.FC<PlansGridProps> = ({
  variant = "auto",
  activeIndex = 0,
  onSelectPlan = () => {},
  onOpenPlan = () => {},
  ctaLabel = "Ver plan",
  plans = defaultPlans,
  features = defaultFeatures,
}) => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (variant !== "auto") return;

    const mq = window.matchMedia("(min-width: 992px)");
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    setIsDesktop(mq.matches);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }

    const mqLegacy = mq as MediaQueryList & { addListener?: (callback: (mq: MediaQueryList) => void) => void; removeListener?: (callback: (mq: MediaQueryList) => void) => void };
    if (typeof mqLegacy.addListener === "function") {
      mqLegacy.addListener(onChange);
      return () => mqLegacy.removeListener?.(onChange);
    }

    const onResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [variant]);

  const renderDesktop = variant === "desktop" || (variant === "auto" && isDesktop);

  return renderDesktop ? (
    <PlansDesktop
      plans={plans}
      features={features}
      onOpenPlan={onOpenPlan}
      ctaLabel={ctaLabel}
    />
  ) : (
    <PlansMobileNew
      plans={plans}
      features={features}
      activeIndex={activeIndex}
      onSelectPlan={onSelectPlan}
      onOpenPlan={onOpenPlan}
      ctaLabel={ctaLabel}
    />
  );
};

export default PlansGrid;
