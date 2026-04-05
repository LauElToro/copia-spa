import React from 'react';
import { Box } from '@mui/material';

interface SectionProps {
title: string;
items: string[];
subText?: string;
}

export const Section: React.FC<SectionProps> = ({ title, items, subText }) => (
<Box
sx={{
position: "relative",
width: "100%",
display: "flex",
flexDirection: "column",
gap: 3,
background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
border: "2px solid rgba(41, 196, 128, 0.1)",
borderRadius: "24px",
overflow: "hidden",
transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
cursor: "default",
"&:hover": {
backgroundColor: "rgba(41, 196, 128, 0.08)",
borderColor: "rgba(41, 196, 128, 0.4)",
},
padding: { xs: 3, md: 4 },
}}

>

<Box

  sx={{
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.875rem",
    lineHeight: 1.6,
    fontFamily:
      "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  }}
>
  <Box
    component="h3"
    sx={{
      fontSize: { xs: '1.25rem', md: '1.5rem' },
      fontWeight: 700,
      color: '#34d399',
      mb: 1,
      fontFamily:
        "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    }}
  >
    {title}
  </Box>
  <Box component="ul" sx={{ pl: 0, m: 0 }}>
    {items.map((item) => (
      <Box
        component="li"
        key={item}
        sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}
      >
        <Box
          component="span"
          sx={{
            color: "#34d399",
            fontSize: "1.125rem",
            mr: 1,
            mt: 0.25,
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          ✓
        </Box>
        <Box component="span" sx={{ flex: 1 }}>
          {item}
        </Box>
      </Box>
    ))}
  </Box>
  {subText && (
    <Box
      component="h4"
      sx={{
        mt: 2,
        fontSize: "1rem",
        fontWeight: 500,
        color: "rgba(255,255,255,0.8)",
      }}
    >
      {subText}
    </Box>
  )}
</Box>


  </Box>
);
