import { Box } from "@mui/material";
import { Image } from "../../atoms/image";
import { Tooltip } from "../../atoms/tooltip";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

interface FooterCertificatesProps {
  className?: string;
}

const FooterCertificates = ({ className = '' }: FooterCertificatesProps) => {
  const { t } = useLanguage();

  return (
    <Box 
      className={className}
      sx={{ 
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 4, md: 6 },
        mb: { xs: 3, md: 8 }
      }}
    >
      {/* Legal Entity Identifier Certificate con QR */}
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 3 }, flexWrap: "wrap" }}>
        <Tooltip 
          title={t.footer.legalEntityIdentifier + " " + t.footer.certificate}
          arrow
          placement="top"
        >
          <Box component="span" sx={{ display: "flex", cursor: "help", height: "88px", alignItems: "center" }}>
            <Image 
              src="/images/lei.svg" 
              alt="Legal Entity Identifier Certificate" 
              width={82} 
              height={88} 
              className="img-responsive" 
              objectFit="contain" 
            />
          </Box>
        </Tooltip>
        <Tooltip 
          title={t.footer.legalEntityIdentifier + " " + t.footer.certificate + " - QR Code"}
          arrow
          placement="top"
        >
          <Box component="span" sx={{ display: "flex", cursor: "help", height: "88px", alignItems: "center" }}>
            <Image 
              src="/images/qr-legal-entity-cert.svg" 
              alt="QR Legal Entity Certificate" 
              width={60} 
              height={60} 
              className="img-responsive" 
              objectFit="contain" 
            />
          </Box>
        </Tooltip>
      </Box>

      {/* ARCA Certification */}
      <Tooltip 
        title={t.footer.arcaCertification}
        arrow
        placement="top"
      >
        <Box component="span" sx={{ display: "flex", cursor: "help", height: "88px", alignItems: "center" }}>
          <Image 
            src="/images/arca.svg" 
            alt="ARCA Certification" 
            width={54} 
            height={66} 
            className="img-responsive footer__certificates_arca" 
            objectFit="contain" 
          />
        </Box>
      </Tooltip>

      {/* KYC/KYB Verification (Sumsub) */}
      <Tooltip 
        title={t.footer.kycVerification}
        arrow
        placement="top"
      >
        <Box component="span" sx={{ display: "flex", cursor: "help", height: "88px", alignItems: "center" }}>
          <Image 
            src="/images/sumsub.svg" 
            alt="Sumsub KYC/KYB Verification" 
            width={72} 
            height={63} 
            className="img-responsive justify-self-center" 
            objectFit="contain" 
          />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default FooterCertificates;

