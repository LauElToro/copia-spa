import { PaginationTheme } from "./types";

export const defaultTheme: PaginationTheme = {
  container: {
    display: "flex",
    gap: 1,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  button: {
    minWidth: "32px",
    height: "32px",
    padding: "0 8px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "rgba(71, 85, 105, 0.3)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "none",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(100, 116, 139, 0.5)",
      color: "#ffffff",
    },
    "&:disabled": {
      backgroundColor: "rgba(71, 85, 105, 0.2)",
      color: "rgba(255, 255, 255, 0.3)",
      cursor: "not-allowed",
    },
  },
  activeButton: {
    backgroundColor: "#29C480",
    color: "#1e293b",
    border: "none",
    "&:hover": {
      backgroundColor: "#ffffff",
      color: "#000000",
    },
  },
  ellipsis: {
    padding: "0 4px",
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "0.875rem",
    minWidth: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
