import Image from "next/image";

export const LandingHeader = ({ desktopSrc, mobileSrc, alt, height = 450 }) => {
  return (
    <div className="landing-header">
      <picture>
        {mobileSrc && <source srcSet={mobileSrc} media="(max-width: 768px)" />}
        <Image
          src={desktopSrc}
          alt={alt}
          width={1700}
          height={height}
          className="landing-header-image"
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </picture>
    </div>
  );
};
