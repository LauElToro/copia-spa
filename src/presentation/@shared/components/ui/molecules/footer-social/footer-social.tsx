import { Box } from "@mui/material";
import { Link } from "../../atoms/link";
import { Tooltip } from "../../atoms/tooltip";

// Usando iconos de MUI que son similares a lucide-react
// Si lucide-react está disponible, se pueden reemplazar
interface SocialMediaProps {
  className?: string;
}

const SocialMedia = ({ className = '' }: SocialMediaProps) => {
  
  return (
    <Box 
      className={className}
      sx={{ 
        display: "flex", 
        gap: 4
      }}
    >
      <Tooltip title="YouTube" placement="top">
        <Box component="span" sx={{ display: "inline-flex" }}>
      <Link 
        href="https://www.youtube.com/channel/UCMzV-3QRWjcmJS6dRndtU9A" 
        target="_blank"
        sx={{
          color: "#94a3b8",
          transition: "color 0.3s ease",
          "&:hover": {
            color: "#29C480"
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
            </Link>
        </Box>
      </Tooltip>
      
      <Tooltip title="LinkedIn" placement="top">
        <Box component="span" sx={{ display: "inline-flex" }}>
      <Link 
        href="https://www.linkedin.com/company/the-liberty-club-3-0/posts/?feedView=all" 
        target="_blank" 
        rel="noopener noreferrer"
        sx={{
          color: "#94a3b8",
          transition: "color 0.3s ease",
          "&:hover": {
            color: "#29C480"
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
            </Link>
        </Box>
      </Tooltip>
      
      <Tooltip title="Instagram" placement="top">
        <Box component="span" sx={{ display: "inline-flex" }}>
      <Link 
        href="https://www.instagram.com/libertyclub.io/" 
        target="_blank"
        sx={{
          color: "#94a3b8",
          transition: "color 0.3s ease",
          "&:hover": {
            color: "#29C480"
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
            </Link>
        </Box>
      </Tooltip>
      
      <Tooltip title="TikTok" placement="top">
        <Box component="span" sx={{ display: "inline-flex" }}>
      <Link 
        href="https://www.tiktok.com/@liberty.club.io" 
        target="_blank"
        sx={{
          color: "#94a3b8",
          transition: "color 0.3s ease",
          "&:hover": {
            color: "#29C480"
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.89 2.89 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
            </Link>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default SocialMedia;