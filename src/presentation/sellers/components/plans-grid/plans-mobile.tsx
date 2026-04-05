"use client";

import React from "react";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Image } from "@/presentation/@shared/components/ui/atoms/image";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Feature, Plan } from "./types";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";

import "swiper/css";
import "swiper/css/pagination";

type Props = {
  plans: Plan[];
  features: Feature[];
  activeIndex: number;
  ctaLabel: string;
  onSelectPlan: (index: number) => void;
  onOpenPlan: (index: number) => void;
};

const PlansMobile: React.FC<Props> = ({
  plans,
  features,
  activeIndex,
  ctaLabel,
  onSelectPlan,
  onOpenPlan}) => {
  return (
    <div className="plans-grid-wrapper">
      <div className="plans-grid-mobile-swiper">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1.5}
          centeredSlides
          initialSlide={activeIndex}
          onSlideChange={(swiper) => onSelectPlan(swiper.activeIndex)}
          className="plans-swiper"
        >
          {plans.map((plan, planIndex) => (
            <SwiperSlide key={`slide-${plan.name}`}>
              <div className="plan-card">
                {plan.label && <div className="plan-label">{plan.label}</div>}

                <Text variant="h4" className="plan-name text-center mb-2">
                  {formatPlanNameForDisplay(plan.name)}
                </Text>
                <Text variant="h5" className="plan-price text-center mb-2" color="#29C480">
                  {plan.price}
                </Text>

                <div className="plan-features-mobile">
                  {features.map((feature, i) => {
                    const v = feature.values[planIndex];
                    return (
                      <div key={`${plan.name}-feat-${i}`} className="feature-row-mobile">
                        <span className="feature-name-mobile">{feature.name}</span>
                        <span className={`feature-value-mobile ${v ? "feature-yes" : "feature-no"}`}>
                          {v === true ? (
                            <Image
                              src="/tilde.svg"
                              alt="Sí"
                              className="feature-icon-mobile"
                              width={18}
                              height={18}
                            />
                          ) : v === false ? (
                            <Image
                              src="/x.svg"
                              alt="No"
                              className="feature-icon-mobile"
                              width={18}
                              height={18}
                            />
                          ) : (
                            v
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Button className="btn-plan mb-4" onClick={() => onOpenPlan(planIndex)}>
                  {ctaLabel}
                </Button>
                <p className="plan-trial text-center">Mas información</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default PlansMobile;
