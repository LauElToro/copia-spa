"use client";
import Image from "next/image";
import { Box } from "@mui/material";

interface HomeBannerProps {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
}

export const HomeBanner: React.FC<HomeBannerProps> = ({ desktopSrc, mobileSrc, alt }) => {
  return (
    <Box className="home-banner" sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Box
        component="picture"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          "& img": {
            width: "100%",
            height: "auto",
            objectFit: "contain"
          }
        }}
      >
        <source srcSet={mobileSrc} media="(max-width: 768px)" />
        <Image src={desktopSrc} alt={alt} width={1700} height={410} className="banner-img" />
      </Box>
    </Box>
  );
};
