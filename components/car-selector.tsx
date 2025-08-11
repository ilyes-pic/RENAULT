"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Car, Factory, Layers, Gauge, Check, Tag, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/components/cart-provider";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  logo?: string;
  photo?: string;
  description?: string;
  models: Model[];
}

interface Model {
  id: string;
  name: string;
  startYear?: number;
  endYear?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  motorisations: Motorisation[];
}

interface Motorisation {
  id: string;
  name: string;
  engine: string;
  power?: number;
  displacement?: number;
}

interface CarSelectorSelection {
  brand?: Brand;
  model?: Model;
  motorisation?: Motorisation;
  mainCategory?: { id: string; name: string };
  subCategory?: { id: string; name: string; parent: { name: string } };
}

interface CarSelectorProps {
  onSelectionChange?: (selection: CarSelectorSelection) => void;
}

// Brand logo mapping
const brandLogos: Record<string, string> = {
  'Citroën': '/brands/citroen.png',
  'Citroen': '/brands/citroen.png',
  'Peugeot': '/brands/peugeot.png',
  
  'Renault': '/brands/renault.png',
  'Dacia': '/brands/dacia.png',
  'Suzuki': '/brands/suzuki.png',
  'Kia': '/brands/kia.png',
};

export function CarSelector({ onSelectionChange }: CarSelectorProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedMotorisation, setSelectedMotorisation] = useState<Motorisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  
  type MinimalCategory = { id: string; name: string; parent?: { name: string }; children?: MinimalCategory[] };
  const [mainCategories, setMainCategories] = useState<MinimalCategory[]>([]);
  const [subCategories, setSubCategories] = useState<MinimalCategory[]>([]);
  const [activeMainCategory, setActiveMainCategory] = useState<MinimalCategory | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<MinimalCategory | null>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const { addItem } = useCart();

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/brands?includeModels=true');
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setBrands(result.data);
          } else {
            setBrands([]);
          }
        } else {
          setBrands([]);
        }
      } catch (error) {
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange?.({
      brand: selectedBrand || undefined,
      model: selectedModel || undefined,
      motorisation: selectedMotorisation || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedModel, selectedMotorisation]);

  const modelsForBrand = useMemo(() => selectedBrand?.models ?? [], [selectedBrand]);
  const motorsForModel = useMemo(() => selectedModel?.motorisations ?? [], [selectedModel]);
  const noModels = !!selectedBrand && modelsForBrand.length === 0;
  const noMotors = !!selectedModel && motorsForModel.length === 0;

  const handleBrandChange = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId) || null;
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedMotorisation(null);
    setShowCategories(false);
  };

  const handleModelChange = (modelId: string) => {
    const model = modelsForBrand.find(m => m.id === modelId) || null;
    setSelectedModel(model);
    setSelectedMotorisation(null);
    setShowCategories(false);
  };

  const handleMotorChange = (motorId: string) => {
    const motor = motorsForModel.find(m => m.id === motorId) || null;
    setSelectedMotorisation(motor);
  };

  const resetSelection = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedMotorisation(null);
    setShowCategories(false);
    setActiveMainCategory(null);
    setActiveSubCategory(null);
    setMainCategories([]);
    setSubCategories([]);
    setParts([]);
  };

  const getMainCategoryImageUrl = (name?: string) => {
    if (!name) return '';
    return `/api/category-image?main=${encodeURIComponent(name)}`;
  };

  const getSubCategoryImageUrl = (parent?: string, name?: string) => {
    if (!parent || !name) return '';
    const params = new URLSearchParams({ parent, name });
    return `/api/category-image?${params.toString()}`;
  };

  // Auto-load categories after motorisation selection
  useEffect(() => {
    let abort = false;
    async function loadCategories() {
      if (!selectedMotorisation) return;
      setShowCategories(true);
      setActiveMainCategory(null);
      setActiveSubCategory(null);
      setSubCategories([]);
      setParts([]);
      setIsLoadingCategories(true);
      try {
        const r = await fetch('/api/categories?source=fs');
        const res = await r.json();
        if (!abort && res.success) {
          setMainCategories(res.data as MinimalCategory[]);
        }
      } catch {}
      finally {
        if (!abort) setIsLoadingCategories(false);
      }
    }
    loadCategories();
    return () => { abort = true };
  }, [selectedMotorisation]);

  const handleMainCategoryClick = (main: MinimalCategory) => {
    setActiveMainCategory(main);
      setActiveSubCategory(null);
    const children = (main.children || []).sort((a, b) => a.name.localeCompare(b.name));
    setSubCategories(children);
    setParts([]);
  };

  const handleSubCategoryClick = async (sub: MinimalCategory) => {
    if (!selectedMotorisation) return;
    setActiveSubCategory(sub);
    setParts([]);
    setIsLoadingParts(true);
    const params = new URLSearchParams({ categoryId: sub.id, motorisationId: selectedMotorisation.id } as any);
    try {
      const res = await fetch(`/api/parts?${params.toString()}`);
      const data = await res.json();
      if (data.success) setParts(data.data.parts);
    } catch {}
    finally {
      setIsLoadingParts(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 lg:px-6 space-y-5">
      <Card className="border bg-card/80 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</span>
            Choisissez votre véhicule
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Marque</label>
              <Select onValueChange={handleBrandChange} value={selectedBrand?.id || undefined}>
                <SelectTrigger className="h-11 rounded-lg text-sm">
                  <SelectValue placeholder={isLoading ? "Chargement..." : "Choisir une marque"} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <span className="block truncate">{b.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">Commencez par choisir la marque.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Modèle</label>
              <Select onValueChange={handleModelChange} value={selectedModel?.id || undefined} disabled={!selectedBrand || !!noModels}>
                <SelectTrigger className="h-11 rounded-lg text-sm disabled:opacity-60">
                  <SelectValue placeholder={!selectedBrand ? "Sélectionnez une marque d'abord" : noModels ? "Aucun modèle disponible" : "Choisir un modèle"} />
                </SelectTrigger>
                <SelectContent>
                  {modelsForBrand.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="block truncate">{m.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">{!selectedBrand ? "Ensuite, sélectionnez le modèle." : noModels ? "Aucun modèle disponible pour cette marque." : ""}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Motorisation</label>
              <Select onValueChange={handleMotorChange} value={selectedMotorisation?.id || undefined} disabled={!selectedModel || !!noMotors}>
                <SelectTrigger className="h-11 rounded-lg text-sm disabled:opacity-60">
                  <SelectValue placeholder={!selectedModel ? "Sélectionnez un modèle d'abord" : noMotors ? "Aucune motorisation disponible" : "Choisir une motorisation"} />
                </SelectTrigger>
                <SelectContent>
                  {motorsForModel.map((mo) => (
                    <SelectItem key={mo.id} value={mo.id}>
                      <span className="block truncate">{mo.engine}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">{!selectedModel ? "Enfin, choisissez la motorisation." : noMotors ? "Aucune motorisation disponible pour ce modèle." : ""}</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                  {selectedBrand?.name || "Marque"}
                  {selectedBrand && <Check className="h-3 w-3 text-primary" />}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                  {selectedModel?.name || "Modèle"}
                  {selectedModel && <Check className="h-3 w-3 text-primary" />}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                  {selectedMotorisation?.engine || "Motorisation"}
                  {selectedMotorisation && <Check className="h-3 w-3 text-primary" />}
                            </span>
                          </span>
            </div>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={resetSelection}>Réinitialiser</Button>
                    </div>
          {selectedMotorisation && (
            <p className="mt-1 text-xs text-muted-foreground">Les catégories compatibles s'affichent ci-dessous.</p>
          )}
        </CardContent>
                </Card>

      {showCategories && (
        <Card className="border bg-card/80 shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-5">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</span>
              Choisissez une catégorie
            </div>
            {!activeMainCategory && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {isLoadingCategories ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border bg-background p-3">
                      <div className="w-full aspect-square bg-muted rounded-lg" />
                      <div className="mt-2 h-3 bg-muted rounded w-2/3" />
                    </div>
                  ))
                ) : (
                  mainCategories.map((main) => (
                  <button
                    key={main.id}
                    className="group rounded-xl border bg-background p-3 text-left hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    onClick={() => handleMainCategoryClick(main)}
                  >
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getMainCategoryImageUrl(main.name)} alt={main.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                    <div className="text-sm font-medium">{main.name}</div>
                  </button>
                ))
                )}
        </div>
      )}

            {activeMainCategory && !activeSubCategory && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
                  <span>{activeMainCategory.name}</span>
            </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      className="group rounded-xl border bg-background p-3 text-left hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      onClick={() => handleSubCategoryClick(sub)}
                    >
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getSubCategoryImageUrl(activeMainCategory.name, sub.name)} alt={sub.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                      <div className="text-sm font-medium">{sub.name}</div>
                    </button>
            ))}
          </div>
        </div>
      )}

            {activeSubCategory && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
                  <span>Pièces: {activeMainCategory?.name} › {activeSubCategory.name}</span>
          </div>
                {isLoadingParts ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-xl animate-pulse">
                        <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                        <div className="h-16 bg-muted rounded mb-3" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : parts.length === 0 ? (
                  <div className="text-muted-foreground">Aucune pièce trouvée pour cette catégorie.</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
              {parts.map((part) => (
                <Card key={part.id} className="group">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                            <div className="font-semibold text-sm sm:text-base">{part.name}</div>
                            <div className="text-primary font-bold">{formatPrice(Number(part.price))}</div>
                    </div>
                    {part.images && part.images.length > 0 && (
                      <div className="flex space-x-2 overflow-x-auto">
                        {part.images.slice(0, 3).map((url: string, i: number) => (
                                // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={url} alt={part.name} className="w-16 h-16 object-cover rounded-md border" />
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">{part.partNumber}</div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() =>
                          addItem(
                            {
                              id: part.id,
                              name: part.name,
                              price: Number(part.price),
                              image: part.images?.[0],
                              partNumber: part.partNumber,
                            },
                            1
                          )
                        }
                      >
                        Ajouter au panier
                      </Button>
                      <Link href={`/parts/${part.id}`}>
                        <Button size="sm" variant="outline">Voir</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

            <div className="pt-2 flex gap-2">
              {activeMainCategory && (
                <Button variant="ghost" size="sm" onClick={() => { setActiveSubCategory(null); setParts([]); }}>Retour</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => { setShowCategories(false); setActiveMainCategory(null); setActiveSubCategory(null); setSubCategories([]); setParts([]); }}>Changer de véhicule</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}