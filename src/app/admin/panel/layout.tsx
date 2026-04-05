'use client'
import { ReactNode } from "react";
import PanelSelector from "@/presentation/@shared/components/layouts/panel-selector";

interface PanelLayoutProps {
  children: ReactNode;
  user: ReactNode;
  commerce: ReactNode;
}

const PanelLayout = ({ children, user, commerce }: PanelLayoutProps) => {
  return <PanelSelector routes={{ children, user, commerce }} />;
};

export default PanelLayout;