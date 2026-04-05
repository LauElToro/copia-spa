"use client";

import React from "react";
import Link from "../../atoms/link/link";
import { Image } from "../../atoms/image";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

export interface HeaderProps {
  showLogo?: boolean;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  showLogo = true,
  children,
}) => {
  const { t } = useLanguage();
  
  return (
    <header className="bg-black">
      <nav className="py-4">
        {showLogo && (
          <div className="d-flex align-items-center justify-content-between m-auto w-75">
            <Link href="/" className="flex items-center w-6">
              <Image
                src="/logo.svg"
                alt="navbar-logo"
                width={40}
                height={25}
              />
            </Link>
            <Link href="/" className="text-decoration-none">{t.menu.backToLibertyClub}</Link>
          </div>
        )}
        {children}
      </nav>
    </header>
  );
};
