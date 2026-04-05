import React from "react";
import { Box } from "@mui/material";
import { Image } from "../image";

interface FooterLogoProps {
  className?: string;
}

const FooterLogo: React.FC<FooterLogoProps> = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        "& > span": {
          width: { xs: "180px", sm: "220px", md: "250px" },
          maxWidth: "100%",
          height: "auto",
        },
        "& img": {
          maxWidth: "100%",
          height: "auto",
          width: "100%",
          objectFit: "contain",
        },
      }}
    >
      <Image
        src="/images/logo-full.svg"
        alt="Liberty Club logo"
        height={35}
        width={250}
        objectFit="contain"
        sx={{
          maxWidth: "100%",
        }}
      />
    </Box>
  );
};

export default FooterLogo;
