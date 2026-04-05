'use client';

import React, { useState } from "react";
import Image from "next/image";

export const StoresCarousel: React.FC = () => {
  const [hoveredArrow, setHoveredArrow] = useState<"prev" | "next" | null>(null);

  const arrowBaseStyle = {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 1s ease-in"};

  const handleArrowHover = (which: "prev" | "next", isHover: boolean) =>
    setHoveredArrow(isHover ? which : null);

  return (
    <div id="storesCarousel" className="carousel slide m-0" data-bs-ride="true">
      <div className="carousel-inner">
        <div className="carousel-item active">
          <picture>
            <source
              srcSet="/images/banner-stores/banner-stores-mobile.svg"
              media="(max-width: 768px)"
            />
            <Image
              src="/images/banner-stores/banner-stores.svg"
              alt="Banner 1"
              width={1700}
              height={450}
              className="d-block w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          </picture>
        </div>
        <div className="carousel-item">
          <picture>
            <source
              srcSet="/images/banner-stores/banner-stores-mobile-3.svg"
              media="(max-width: 768px)"
            />
            <Image
              src="/images/banner-stores/banner-stores-2.svg"
              alt="Banner 2"
              width={1700}
              height={450}
              className="d-block w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          </picture>
        </div>
        <div className="carousel-item">
          <picture>
            <source
              srcSet="/images/banner-stores/banner-stores-mobile-2.svg"
              media="(max-width: 768px)"
            />
            <Image
              src="/images/banner-stores/banner-stores-3.svg"
              alt="Banner 3"
              width={1700}
              height={450}
              className="d-block w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          </picture>
        </div>
      </div>

      <div className="carousel-indicators d-md-none">
        <button type="button" data-bs-target="#storesCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#storesCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#storesCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#storesCarousel"
        data-bs-slide="prev"
        style={arrowBaseStyle}
        onMouseEnter={() => handleArrowHover("prev", true)}
        onMouseLeave={() => handleArrowHover("prev", false)}
      >
        <Image
          src="/images/icons/chevron-left.svg"
          alt="Prev"
          width={30}
          height={30}
          style={{
            filter: hoveredArrow === "prev" ? "drop-shadow(0 0 1.5px #43e97b)" : "none"}}
        />
        <span className="visually-hidden">Previous</span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#storesCarousel"
        data-bs-slide="next"
        style={arrowBaseStyle}
        onMouseEnter={() => handleArrowHover("next", true)}
        onMouseLeave={() => handleArrowHover("next", false)}
      >
        <Image
          src="/images/icons/chevron-right.svg"
          alt="Next"
          width={30}
          height={30}
          style={{
            filter: hoveredArrow === "next" ? "drop-shadow(0 0 1.5px #43e97b)" : "none"}}
        />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};
