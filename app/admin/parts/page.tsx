"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Package, Car, Zap, Tag, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Part {
  id: string;
  name: string;
  partNumber: string;
  description?: string;
  price: number;
  manufacturer?: string;
  images?: string[];
  category: {
    id: string;
    name: string;
    parent?: {
      id: string;
      name: string;
    };
  };
  motorisations: Array<{
    id: string;
    motorisation: {
      id: string;
      name: string;
      engine: string;
      model: {
        id: string;
        name: string;
        brand: {
          id: string;
          name: string;
          logo?: string;
          photo?: string;
        };
      };
    };
  }>;
  stockQuantity: number;
  availability: string;
  engineCode?: string;
  capacity?: string;
  material?: string;
  color?: string;
}

interface Category {
  id: string;
  name: string;
  parent?: {
    id: string;
    name: string;
  };
}

const availabilityLabels: Record<string, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Rupture de stock",
  PREORDER: "Pré-commande",
  DISCONTINUED: "Arrêté"
};

const availabilityColors: Record<string, string> = {
  IN_STOCK: "text-green-600 dark:text-green-400",
  OUT_OF_STOCK: "text-red-600 dark:text-red-400",
  PREORDER: "text-yellow-600 dark:text-yellow-400",
  DISCONTINUED: "text-gray-600 dark:text-gray-400"
};

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [partsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/admin/parts'),
          fetch('/api/admin/categories')
        ]);

        if (partsResponse.ok) {
          const partsResult = await partsResponse.json();
          if (partsResult.success && Array.isArray(partsResult.data.parts)) {
            setParts(partsResult.data.parts);
            setFilteredParts(partsResult.data.parts);
          }
        }

        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json();
          if (categoriesResult.success && Array.isArray(categoriesResult.data)) {
            setCategories(categoriesResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter parts based on search and filters
  useEffect(() => {
    let filtered = parts;

    if (searchTerm) {
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.motorisations.some(pm => 
          pm.motorisation.model.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pm.motorisation.model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pm.motorisation.engine.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(part => 
        part.category.id === selectedCategory || 
        part.category.parent?.id === selectedCategory
      );
    }

    if (selectedAvailability) {
      filtered = filtered.filter(part => part.availability === selectedAvailability);
    }

    setFilteredParts(filtered);
  }, [parts, searchTerm, selectedCategory, selectedAvailability]);

  const handleDeletePart = async (partId: string, partName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la pièce "${partName}" ? Cette action est irréversible.`)) {
      try {
        const response = await fetch(`/api/admin/parts/${partId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setParts(parts.filter(p => p.id !== partId));
          setFilteredParts(filteredParts.filter(p => p.id !== partId));
        } else {
          const result = await response.json();
          alert(result.error || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting part:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Get unique main categories for filter
  const mainCategories = categories.filter(cat => !cat.parent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des pièces détachées</h1>
          <p className="text-muted-foreground">
            Gérez votre inventaire de pièces automobiles et leurs compatibilités
          </p>
        </div>
        <Link href="/admin/parts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle pièce
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-foreground">Filtres et recherche</span>
        </div>
        <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une pièce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {mainCategories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select
          value={selectedAvailability}
          onChange={(e) => setSelectedAvailability(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Toutes les disponibilités</option>
          {Object.entries(availabilityLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <Card className="p-4">
          <div className="text-2xl font-bold">{filteredParts.length}</div>
          <div className="text-sm text-muted-foreground">Pièces affichées</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{filteredParts.reduce((sum, part) => sum + part.stockQuantity, 0)}</div>
          <div className="text-sm text-muted-foreground">Stock total</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {filteredParts.reduce((sum, part) => sum + part.motorisations.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Compatibilités</div>
        </Card>
        </div>
      </div>

      {/* Parts Grid */}
      {isLoading ? (
        <div className="grid gap-4 lg:gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredParts.map((part) => (
            <Card key={part.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Package className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="truncate">{part.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {part.partNumber}
                      </span>
                      {part.manufacturer && (
                        <span className="text-sm text-muted-foreground">
                          {part.manufacturer}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {Number(part.price).toFixed(2)} €
                    </div>
                    <div className={cn("text-sm font-medium", availabilityColors[part.availability])}>
                      {availabilityLabels[part.availability]}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Images */}
                {part.images && part.images.length > 0 && (
                  <div>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {part.images.slice(0, 3).map((imageUrl, index) => (
                        <div key={index} className="flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={`${part.name} - Image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md border hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        </div>
                      ))}
                      {part.images.length > 3 && (
                        <div className="flex-shrink-0 w-16 h-16 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-xs text-gray-500">
                          +{part.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Category and Description */}
                <div>
                  <div className="mb-2">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800 rounded-lg px-3 py-1.5">
                      <Tag className="h-3 w-3 text-purple-500" />
                      <div className="text-xs">
                        {part.category.parent && (
                          <>
                            <span className="font-semibold text-purple-700 dark:text-purple-300">
                              {part.category.parent.name}
                            </span>
                            <span className="mx-1 text-purple-500 dark:text-purple-400">›</span>
                          </>
                        )}
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {part.category.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  {part.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {part.description}
                    </p>
                  )}
                </div>

                {/* Technical specs */}
                {(part.engineCode || part.capacity || part.material || part.color) && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {part.engineCode && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">Code moteur</div>
                        <div className="text-blue-500 dark:text-blue-500">{part.engineCode}</div>
                      </div>
                    )}
                    {part.capacity && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <div className="text-green-600 dark:text-green-400 font-medium">Capacité</div>
                        <div className="text-green-500 dark:text-green-500">{part.capacity}</div>
                      </div>
                    )}
                    {part.material && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                        <div className="text-purple-600 dark:text-purple-400 font-medium">Matériel</div>
                        <div className="text-purple-500 dark:text-purple-500">{part.material}</div>
                      </div>
                    )}
                    {part.color && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                        <div className="text-orange-600 dark:text-orange-400 font-medium">Couleur</div>
                        <div className="text-orange-500 dark:text-orange-500">{part.color}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Compatible vehicles */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Compatible avec {part.motorisations.length} motorisation{part.motorisations.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  {part.motorisations.length > 0 && (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {part.motorisations.slice(0, 3).map((pm) => (
                        <div key={pm.id} className="flex items-center space-x-2 text-xs">
                          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center overflow-hidden">
                            {pm.motorisation.model.brand.photo || pm.motorisation.model.brand.logo ? (
                              <img
                                src={pm.motorisation.model.brand.photo || pm.motorisation.model.brand.logo}
                                alt={pm.motorisation.model.brand.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {pm.motorisation.model.brand.name} {pm.motorisation.model.name} {pm.motorisation.engine}
                          </span>
                        </div>
                      ))}
                      {part.motorisations.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{part.motorisations.length - 3} autres...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stock info */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Stock</span>
                  </div>
                  <span className="font-bold text-primary">{part.stockQuantity} unités</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/admin/parts/${part.id}/edit`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit2 className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePart(part.id, part.name)}
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredParts.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || selectedCategory || selectedAvailability ? 'Aucune pièce trouvée' : 'Aucune pièce'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory || selectedAvailability
              ? 'Aucune pièce ne correspond à vos critères de recherche.'
              : 'Commencez par ajouter votre première pièce détachée.'
            }
          </p>
          <div className="space-x-2">
            {(searchTerm || selectedCategory || selectedAvailability) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedAvailability("");
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
            <Link href="/admin/parts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une pièce
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}