"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="section-container py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Logo width={32} height={32} />
              <div>
                <h3 className="font-bold text-primary">ZORRAGA</h3>
                <p className="text-xs text-muted-foreground">VÉHICULES</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre solution pour la sélection de véhicules automobiles. 
              Simple, rapide et fiable.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/vehicules" className="text-muted-foreground hover:text-primary">
                  Véhicules
                </Link>
              </li>
              <li>
                <Link href="/selection" className="text-muted-foreground hover:text-primary">
                  Sélection
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold">Nos services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-primary">
                  Recherche véhicule
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-muted-foreground hover:text-primary">
                  Toutes les marques
                </Link>
              </li>
              <li>
                <Link href="/models" className="text-muted-foreground hover:text-primary">
                  Tous les modèles
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-muted-foreground hover:text-primary">
                  Guide d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-primary">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  123 Rue de l'Automobile<br />
                  75001 Paris, France
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">contact@zorraga.com</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Horaires d'ouverture</p>
              <p>Lun-Ven: 8h00 - 18h00</p>
              <p>Sam: 9h00 - 17h00</p>
              <p>Dim: Fermé</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2024 ZORRAGA Véhicules. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Conditions d'utilisation
            </Link>
            <Link href="/legal" className="hover:text-primary">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}