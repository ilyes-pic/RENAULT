"use client";

import React, { useState } from "react";
import { Search, Car, Wrench, Truck, Shield, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CarSelector } from "@/components/car-selector";

export default function HomePage() {
  const [showCarSelector, setShowCarSelector] = useState(false);

  const features = [
    {
      icon: <Car className="h-8 w-8" />,
      title: "Base de données complète",
      description: "Plus de 189 modèles de véhicules pour toutes marques",
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Recherche intelligente",
      description: "Trouvez rapidement votre véhicule par marque, modèle ou motorisation",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Données fiables",
      description: "Informations vérifiées et mise à jour régulière",
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Interface intuitive",
      description: "Sélection simple en 3 étapes: Marque → Modèle → Motorisation",
    },
  ];





  return (
    <div className="page-wrapper">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        <div className="section-container relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-in">
                Sélectionnez{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  votre véhicule
                </span>
                <br />
                facilement
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in">
                Trouvez rapidement votre marque, modèle et motorisation 
                grâce à notre sélecteur de véhicules intelligent.
              </p>
            </div>

            {/* Quick search */}
            <div className="max-w-2xl mx-auto space-y-4 animate-slide-in">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button
                  variant="zorraga"
                  size="xl"
                  onClick={() => setShowCarSelector(!showCarSelector)}
                  className="bg-background/80 backdrop-blur-sm border-2 hover:border-primary"
                >
                  <Car className="mr-2 h-5 w-5" />
                  Commencer la sélection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Car Selector */}
      <section className="py-8 sm:py-12 border-t bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Sélectionnez votre véhicule</h2>
            <p className="text-muted-foreground">
              Choisissez votre marque, modèle et motorisation en quelques clics
            </p>
          </div>
          <div className="flex justify-center w-full">
            <CarSelector
              onSelectionChange={(selection) => {
                console.log('Selection:', selection);
              }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Pourquoi choisir notre sélecteur ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution moderne et efficace pour identifier votre véhicule
            </p>
          </div>
          
          <div className="responsive-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group card-enhanced transition-all duration-300">
                <CardContent className="pt-8">
                  <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>





      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Ce que disent nos clients</h2>
            <div className="flex justify-center mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-muted-foreground">
              Plus de 10 000 clients satisfaits nous font confiance
            </p>
          </div>
          
          <div className="responsive-grid grid-cols-1 md:grid-cols-3">
            {[
              {
                name: "Marie Dubois",
                text: "Service excellent, livraison rapide et pièces de qualité. Je recommande !",
                rating: 5,
              },
              {
                name: "Pierre Martin",
                text: "J'ai trouvé facilement la pièce pour ma Renault. Prix très compétitif.",
                rating: 5,
              },
              {
                name: "Sophie Laurent",
                text: "Support client réactif et conseils techniques précieux. Parfait !",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="card-enhanced">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="section-container">
          <Card className="bg-gradient-to-r from-primary to-accent text-white shadow-2xl border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Avez-vous trouvé votre véhicule ?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Notre sélecteur vous aide à identifier précisément votre modèle
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => setShowCarSelector(true)}
                >
                  Recommencer la sélection
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                  Contactez-nous
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}