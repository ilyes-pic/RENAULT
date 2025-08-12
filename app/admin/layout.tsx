"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, Shield, Zap, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    title: "Tableau de bord",
    href: "/admin",
    icon: Home,
    description: "Vue d'ensemble et statistiques"
  },
  {
    title: "Véhicules",
    href: "/admin/brands",
    icon: Car,
    description: "Gestion des marques, modèles et motorisations"
  },
  {
    title: "Modèles",
    href: "/admin/models",
    icon: Car,
    description: "Catalogue des modèles"
  },
  {
    title: "Pièces détachées",
    href: "/admin/parts",
    icon: Settings,
    description: "Inventaire des pièces automobiles"
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold text-lg sm:text-xl text-foreground">GROUPE RENAULT</span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <span className="hidden sm:block text-sm text-muted-foreground font-medium">Administration</span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Link href="/" className="hidden sm:block">
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Retour au site
              </Button>
            </Link>
            <Link href="/" className="sm:hidden">
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="lg:flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 top-16 z-40 bg-black/50 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background transition-transform duration-300 ease-in-out",
          "lg:relative lg:top-0 lg:translate-x-0 lg:z-30 lg:bg-background/50 lg:backdrop-blur-sm lg:flex-shrink-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex h-full flex-col gap-1 p-3 lg:p-4">
            <nav className="flex flex-col gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 lg:py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      <span className={cn(
                        "text-xs hidden lg:block leading-tight",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground/60"
                      )}>
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer Links */}
            <div className="mt-auto border-t border-border pt-4 lg:hidden">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Retour au site
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 lg:h-[calc(100vh-4rem)] lg:overflow-auto">
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}