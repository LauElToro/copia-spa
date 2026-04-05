// Navbar.tsx
import React from "react";
import { Box, Container } from "@mui/material";
import { FooterProps } from "./types";
import { Link } from '../../atoms/link';
import { Text } from '../../atoms/text';
import { Image } from '../../atoms/image';
import SocialMedia from "../footer-social/footer-social";
import FooterCertificates from "../footer-certificates";
import { DropdownButton } from '../dropdown-button';
import type { DropdownButtonOption } from '../dropdown-button/types';
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import type { Language } from "@/presentation/@shared/i18n/types";
import LibiaChatWithUser from '../libia-chat/libia-chat-with-user';

const _downloadReferidos = async (event: React.MouseEvent<HTMLAnchorElement>, t: { footer: { downloading: string; referralSystem: string } }) => {
  try {
    const link = event.target as HTMLAnchorElement;
    const originalText = link.textContent;
    link.textContent = t.footer.downloading;
    link.style.pointerEvents = 'none';
    link.style.opacity = '0.7';

    // Create anchor element
    const downloadLink = document.createElement('a');
    downloadLink.href = '/files/referidos-libertyclub.pdf';
    downloadLink.download = 'referidos-libertyclub.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    // Restore original link
    setTimeout(() => {
      link.textContent = originalText;
      link.style.pointerEvents = 'auto';
      link.style.opacity = '1';
    }, 2000);
  } catch (error) {
    console.error('Error en la descarga:', error);
    // Restore original link
    const link = event.target as HTMLAnchorElement;
    link.textContent = t.footer.referralSystem;
    link.style.pointerEvents = 'auto';
    link.style.opacity = '1';
  }
}

const Footer: React.FC<FooterProps> = ({
  className = "" }) => {
  const footerClass = `py-4 pt-3 mt-auto ${className}`;
  const { t } = useLanguage();

  return (
    <Box
      component="footer"
      className={footerClass}
      sx={{
        py: { xs: 4, md: 16 },
        px: { xs: 4, sm: 6, lg: 8 },
        mt: "auto",
        borderTop: "1px solid #151515",
        background: `
          radial-gradient(ellipse 1400px 800px at 50% 30%, #1a1a1a 0%, #000000 70%),
          radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
          radial-gradient(ellipse 900px 700px at 85% 60%, #2a2a2a 0%, #000000 65%)
        `,
        backgroundColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              rgba(0, 0, 0, 0.25) 0px,
              rgba(0, 0, 0, 0.25) 1px,
              transparent 1px,
              transparent 2px,
              rgba(42, 42, 42, 0.3) 2px,
              rgba(42, 42, 42, 0.3) 3px,
              transparent 3px,
              transparent 4px
            ),
            repeating-linear-gradient(
              -45deg,
              rgba(0, 0, 0, 0.25) 0px,
              rgba(0, 0, 0, 0.25) 1px,
              transparent 1px,
              transparent 2px,
              rgba(42, 42, 42, 0.3) 2px,
              rgba(42, 42, 42, 0.3) 3px,
              transparent 3px,
              transparent 4px
            )
          `,
          backgroundSize: '6px 6px, 6px 6px',
          opacity: 0.9,
          zIndex: 1,
          pointerEvents: 'none'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15) 0px,
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.15) 0px,
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            )
          `,
          backgroundSize: '3px 3px',
          opacity: 0.7,
          zIndex: 1,
          pointerEvents: 'none',
          mixBlendMode: 'overlay'
        }
      }}
    >
<LibiaChatWithUser />

      <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 4 }, px: { xs: 4, sm: 6, lg: 8 }, position: "relative", zIndex: 2 }}>
        <Box sx={{
          display: { xs: "block", lg: "grid" },
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(4, 1fr)"
          },
          gap: { xs: 3, md: 8 },
          mb: { xs: 3, md: 12 },
          overflow: "visible"
        }}>
          {/* Logo y descripción - Mobile First */}
          <Box sx={{ overflow: "visible", minWidth: 0, maxWidth: "100%" }}>
            <Box sx={{
              display: "flex",
              alignItems: "center",
              mb: 4,
              overflow: "visible",
              width: "fit-content",
              maxWidth: "100%"
            }}>
              <Image
                src="/images/logo-full.svg"
                alt="Liberty Club logo"
                height={35}
                width={200}
                sx={{
                  minWidth: 200,
                  width: 200,
                  maxWidth: "100%",
                  flexShrink: 0,
                  objectFit: "contain"
                }}
              />
            </Box>
            <Text
              sx={{
                mb: { xs: 2, md: 6 },
                fontSize: "0.875rem",
                color: "#94a3b8",
                lineHeight: "1.625"
              }}
            >
              {t.footer.marketplaceTagline}
            </Text>
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <Box
                component="h4"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#ffffff",
                  marginTop: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  marginBottom: "0.75rem",
                  padding: 0,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                {t.footer.socialNetworks || "Redes sociales"}
              </Box>
              <Box sx={{ display:  "flex" }}>
                <SocialMedia />
              </Box>
            </Box>
          </Box>

          {/* Contenedor para Important Links y Categories*/}
          <Box sx={{
            display: { xs: "block", md: "contents" },
            gridTemplateColumns: { xs: "none", md: "none" },
            gap: { xs: 0, md: 0 },
            columnGap: { xs: 0, md: 0 }
          }}>

            {/* Enlaces importantes - Mobile First */}
            <Box sx={{
              pr: { xs: 3, md: 0 }
            }}>
              <Box
                component="h4"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#ffffff",
                  marginTop: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  marginBottom: "1rem",
                  padding: 0,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                {t.footer.importantLinks}
              </Box>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0px" }}>
                <li>
                  <Link
                    href="/files/referidos-libertyclub.pdf"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      _downloadReferidos(e as unknown as React.MouseEvent<HTMLAnchorElement>, t);
                    }}
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.referralSystem}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacity"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.privacyPolicies}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.termsAndConditions}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.securityPolicies}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/marks"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.brandsInvitation}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/verify"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.verificationSystem}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publication"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.publishingPolicies}
                  </Link>
                </li>
              </ul>
            </Box>

            {/* Enlaces de navegación - Mobile First */}
            <Box>
              <Box
                component="h4"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#ffffff",
                  marginTop: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  marginBottom: "1rem",
                  padding: 0,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                {t.menu.categories || "Categorías"}
              </Box>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0px" }}>
                <li>
                  <Link
                    href="/sellers"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.menu.sell}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.menu.enterAccount}
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://blog.libertyclub.io/"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.menu.contact}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutorials"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      transition: "color 0.3s ease",
                      textDecoration: "none",
                      "&:hover": {
                        color: "#29C480"
                      }
                    }}
                  >
                    {t.footer.tutorials}
                  </Link>
                </li>
              </ul>
            </Box>
          </Box>

          {/* Información legal - Mobile First */}
          <Box>
            <Box
              component="h4"
              sx={{
                fontWeight: 600,
                fontSize: "1rem",
                color: "#ffffff",
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: "1rem",
                padding: 0,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              {t.footer.legalInfo}
            </Box>
            <Text
              sx={{
                fontSize: "0.75rem",
                color: "#94a3b8",
                lineHeight: "1.625"
              }}
            >
              <Box component="span" sx={{ fontWeight: "semibold", color: "#94a3b8" }}>{t.footer.legalName}:</Box> LBC CLUB SA<br />
              <Box component="span" sx={{ fontWeight: "semibold", color: "#94a3b8" }}>{t.footer.commercialName}:</Box> Liberty club<br />
              <Box component="span" sx={{ fontWeight: "semibold", color: "#94a3b8" }}>{t.footer.taxId}:</Box> 30719054230<br />
              <Box component="span" sx={{ fontWeight: "semibold", color: "#94a3b8" }}>Domicilio:</Box>{" "}
              <Link
                href="https://www.google.com/maps/search/?api=1&query=Diaz+Coronel+av+2427+piso+10+Dpto+A+1425+Ciudad+autónoma+de+Buenos+Aires"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#29C480",
                    textDecoration: "underline"
                  }
                }}
              >
                Diaz Coronel av 2427 piso:10 Dpto: A 1425 - Ciudad autónoma de Buenos Aires
              </Link>
            </Text>
          </Box>
        </Box>

        {/* Certificados */}
        <FooterCertificates />

        {/* Separador */}
        <Box
          sx={{
            width: "100%",
            mb: { xs: 2, md: 2 },
            mt: { xs: 2, md: 2 },
            height: "1px",
            background: "#151515",
            maxWidth: "768px",
            mx: "auto"
          }}
        />

        {/* Copyright - Mobile First */}
        <Box sx={{
          width: "100%",
          textAlign: "center",
          pt: { xs: 1, md: 2 }
        }}>
          <Text
            sx={{
              fontSize: { xs: "0.875rem", md: "0.875rem" },
              color: "#94a3b8"
            }}
            component="p"
          >
            © {new Date().getFullYear()}-LIBERTY CLUB
          </Text>
        </Box>

        {/*         <div className="d-flex justify-content-center align-items-center mt-3">
          <Switch
            checked={mode === "light"}
            onChange={toggleMode}
            label={mode === "dark" ? "Modo Oscuro" : "Modo Claro"}
            id="themeSwitch"
            className={mode === 'light' ? 'theme-switch-light' : ''}
          />
        </Stack> */}


      </Container>

    </Box>
  );
};


export default Footer;
