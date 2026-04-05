"use client";

import { Box } from "@mui/material";
import { LockReset as LockResetIcon } from "@mui/icons-material";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

interface PasswordRecoveryHeroProps {
  className?: string;
}

const PasswordRecoveryHero = ({ className = '' }: PasswordRecoveryHeroProps) => {
  const { t } = useLanguage();

  return (
    <Box
      component="section"
      className={className}
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "400px",
        boxSizing: "border-box",
        background: `
          radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.95) 0%, rgba(41, 196, 128, 0.9) 30%, rgba(16, 185, 129, 0.8) 50%),
          radial-gradient(ellipse 500px 400px at 70% 30%, rgba(34, 197, 94, 0.9) 0%, rgba(41, 196, 128, 0.85) 40%, rgba(16, 185, 129, 0.8) 70%)
        `,
        border: "2px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Blur effect */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 256,
          height: 256,
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderRadius: "50%",
          filter: "blur(64px)",
          zIndex: 0
        }}
      />
      
      {/* Large rotated icon background */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-15deg)",
          width: { xs: "600px", md: "800px", lg: "1000px" },
          height: { xs: "600px", md: "800px", lg: "1000px" },
          zIndex: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: 0.2,
        }}
      >
        <LockResetIcon
          sx={{
            width: "100%",
            height: "100%",
            color: "#ffffff",
          }}
        />
      </Box>
      
      <Box sx={{
        maxWidth: "90%",
        mx: "auto",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        textAlign: "center",
        px: { xs: 3, md: 6 }
      }}>
        <Box
          component="h1"
          sx={{
            fontSize: { xs: "2.288rem", md: "2.8rem" },
            mb: { xs: 1, md: 1.5 },
            margin: 0,
            padding: 0,
            width: "100%",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1
          }}
        >
          {t.auth?.recoverPassword || "Recuperar Contraseña"}
        </Box>
        <Box
          component="span"
          sx={{
            mt: { xs: 0.5, md: 0.5 },
            width: "100%",
            fontSize: { xs: "1.6rem", md: "1.96rem" },
            fontWeight: 700,
            color: "#000000",
            display: "block",
            mb: { xs: 1, md: 1.5 }
          }}
        >
          {t.auth?.recoverPasswordSubtitle || "Restablece tu contraseña"}
        </Box>
        <Box
          component="p"
          sx={{
            fontSize: { xs: "1.4rem", md: "1.125rem" },
            color: "#ffffff",
            mb: 0,
            mt: { xs: 2, md: 2 },
            maxWidth: "100%",
            mx: "auto",
            margin: "0 auto",
            padding: 0
          }}
        >
          {t.auth?.recoverPasswordDescription || "Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña."}
        </Box>
      </Box>
    </Box>
  );
};

export default PasswordRecoveryHero;

