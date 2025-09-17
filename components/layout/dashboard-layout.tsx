"use client";

import { useState } from "react";
import Navbar from "./navbar2";
import Sidebar from "./sidebar2";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div>
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onMenuToggle={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      </div>
      {/* Fixed Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMenuClose={closeMobileMenu} />
      {/* Main Content */}
      <main
        className="
          pt-16
          md:ml-64
          min-h-screen
          bg-gray-50
          overflow-auto
          transition-all
        "
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}