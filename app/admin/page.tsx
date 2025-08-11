"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Car, Zap, TrendingUp, Plus, Activity, Package, Tag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardStats {
  brands: number;
  models: number;
  motorisations: number;
  parts: number;
  categories: number;
  recentActivity: {
    brands: number;
    models: number;
    motorisations: number;
    parts: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/dashboard');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStats({
              brands: result.data.totals.brands,
              models: result.data.totals.models,
              motorisations: result.data.totals.motorisations,
              parts: result.data.totals.parts,
              categories: result.data.totals.categories,
              recentActivity: {
                brands: result.data.recent?.brands || 0,
                models: result.data.recent?.models || 0,
                motorisations: result.data.recent?.motorisations || 0,
                parts: result.data.recent?.parts || 0,
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Marques",
      value: stats?.brands || 0,
      icon: Shield,
      href: "/admin/brands",
      color: "blue",
      recent: stats?.recentActivity.brands || 0,
      description: "marques automobiles"
    },
    {
      title: "Modèles",
      value: stats?.models || 0,
      icon: Car,
      href: "/admin/models", 
      color: "green",
      recent: stats?.recentActivity.models || 0,
      description: "modèles de véhicules"
    },
    {
      title: "Motorisations",
      value: stats?.motorisations || 0,
      icon: Zap,
      href: "/admin/motorisations",
      color: "purple",
      recent: stats?.recentActivity.motorisations || 0,
      description: "configurations moteur"
    },
    {
      title: "Pièces détachées",
      value: stats?.parts || 0,
      icon: Package,
      href: "/admin/parts",
      color: "orange",
      recent: stats?.recentActivity.parts || 0,
      description: "pièces automobiles"
    },
    {
      title: "Catégories",
      value: stats?.categories || 0,
      icon: Tag,
      href: "/admin/categories",
      color: "pink",
      recent: 0,
      description: "catégories de pièces"
    }
  ];

  const quickActions = [
    {
      title: "Gérer les véhicules",
      description: "Gérer marques, modèles et motorisations",
      href: "/admin/brands",
      icon: Car,
      color: "blue"
    },
    {
      title: "Nouvelle pièce",
      description: "Ajouter une nouvelle pièce détachée",
      href: "/admin/parts/new",
      icon: Package,
      color: "orange"
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Administration ZORRAGA</h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
          Gérez votre catalogue automobile et les données de pièces détachées
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="relative overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                  card.color === "blue" && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                  card.color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                  card.color === "purple" && "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                  card.color === "orange" && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                  card.color === "pink" && "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                )}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                    {card.recent > 0 && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{card.recent} récents
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <Link href={card.href} className="absolute inset-0" />
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Actions rapides</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      action.color === "blue" && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                      action.color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400", 
                      action.color === "purple" && "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                      action.color === "orange" && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                    )}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg">{action.title}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activité récente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Activité des 30 derniers jours :
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    <strong>{stats?.recentActivity.brands || 0}</strong> nouvelles marques
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    <strong>{stats?.recentActivity.models || 0}</strong> nouveaux modèles
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">
                    <strong>{stats?.recentActivity.motorisations || 0}</strong> nouvelles motorisations
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}