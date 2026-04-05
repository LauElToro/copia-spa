import React from "react";
import NextLink from "next/link";
import { Link as MuiLink, LinkProps as MuiLinkProps } from "@mui/material";
import { defaultTheme, LinkTheme } from "./theme";

export interface LinkProps
  extends Omit<MuiLinkProps, "href" | "variant"> {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "primary" | "text";
  theme?: LinkTheme;
  size?: 1 | 2 | 3 | 4 | 5 | 6;
  weight?: "lighter" | 300 | 400 | 500 | 600 | "bolder" | 700;
}

const WEIGHT = {
  lighter : "lighter",
  300: "light",
  400: "normal",
  500: "medium",
  600: "semibold",
  bolder: "bolder",
  700: "bold"
}

export const LinkComponent: React.FC<LinkProps> = ({
  href,
  children,
  className = "",
  target,
  rel,
  onClick,
  variant = "primary",
  theme = defaultTheme,
  size = 6,
  weight = 400,
  ...muiProps
}) => {

  const [isHovered, setIsHovered] = React.useState(false);

  const sizeClass = size === 6 ? "" : `fs-${size}`;
  const weightClass =  weight === 400 ? "" : `fw-${WEIGHT[weight]}`

  const inputClasses = [
    sizeClass,
    weightClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const linkStyles = isHovered 
    ? { 
        color: theme.variants[variant].hover?.color,
        fontSize: theme.variants[variant].fontSize || "1rem"}
    : {
        color: theme.variants[variant].color,
        fontSize: theme.variants[variant].fontSize || "1rem"}

  const externalLink = target === "_blank";
  const defaultRel = externalLink ? "noopener noreferrer" : undefined;

  return (
    <MuiLink
      component={NextLink}
      href={href}
      className={inputClasses}
      underline="none"
      sx={{
        ...linkStyles,
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        textDecorationLine: "none",
        textUnderlineOffset: 0,
        transition: "color 0.2s ease-in-out",
        verticalAlign: "middle",
        "&:link": {
          textDecoration: "none",
          textDecorationLine: "none"
        },
        "&:visited": {
          textDecoration: "none",
          textDecorationLine: "none"
        },
        "&:hover": {
          color: theme.variants[variant].hover?.color,
          textDecoration: "none",
          textDecorationLine: "none"
        },
        "&:active": {
          textDecoration: "none",
          textDecorationLine: "none"
        },
        "&:focus": {
          textDecoration: "none",
          textDecorationLine: "none"
        },
        "&:focus-visible": {
          textDecoration: "none",
          textDecorationLine: "none"
        }
      }}
      target={target}
      rel={rel || defaultRel}
      onClick={onClick ? (e: React.MouseEvent) => onClick(e) : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...muiProps}
    >
      {children}
    </MuiLink>
  );
};

export default LinkComponent;
