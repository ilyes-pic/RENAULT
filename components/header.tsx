"use client";

import React from "react";
import Link from "next/link";
import { Search, ShoppingCart, Menu, Phone, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar with contact info */}
      <div className="border-b bg-muted/30">
        <div className="section-container flex h-10 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>+33 1 23 45 67 89</span>
            </span>
            <span className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>contact@zorraga.com</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span>Sélecteur de véhicules intelligent</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="section-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Logo width={40} height={40} />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-primary">ZORRAGA</h1>
            <p className="text-xs text-muted-foreground">VÉHICULES</p>
          </div>
        </Link>

        {/* Search bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                placeholder="Rechercher une marque, un modèle..."
                className="pl-10 pr-4 input-enhanced"
              />
          </div>
        </div>

        {/* Navigation and actions */}
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/vehicules"
              className="transition-colors hover:text-primary"
            >
              Véhicules
            </Link>
            <Link
              href="/selection"
              className="transition-colors hover:text-primary"
            >
              Sélection
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-primary"
            >
              Contact
            </Link>
            <Link
              href="/admin"
              className="transition-colors hover:text-primary text-muted-foreground"
              title="Administration"
            >
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                0
              </span>
            </Button>

            <Link href="/admin">
              <Button variant="ghost" size="icon" title="Administration">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="lg:hidden border-t p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une marque, un modèle..."
            className="pl-10"
          />
        </div>
      </div>
    </header>
  );
}