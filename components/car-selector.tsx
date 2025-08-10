"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Car, Zap, Fuel, Calendar, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

interface CarSelectorProps {
  onSelectionChange?: (selection: {
    brand?: Brand;
    model?: Model;
    motorisation?: Motorisation;
  }) => void;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'brand' | 'model' | 'motorisation'>('brand');
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        console.log('Starting to fetch brands...');
        const response = await fetch('/api/brands?includeModels=true');
        console.log('Response status:', response.status);
        if (response.ok) {
          const result = await response.json();
          console.log('Fetched brands data:', result);
          if (result.success && Array.isArray(result.data)) {
            setBrands(result.data);
          } else {
            console.error('Invalid API response format:', result);
            setBrands([]);
          }
        } else {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          setBrands([]);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.({
      brand: selectedBrand || undefined,
      model: selectedModel || undefined,
      motorisation: selectedMotorisation || undefined,
    });
  }, [selectedBrand, selectedModel, selectedMotorisation, onSelectionChange]);

  // Filter brands based on search term
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands;
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  // Filter models based on search term
  const filteredModels = useMemo(() => {
    if (!selectedBrand) return [];
    if (!searchTerm) return selectedBrand.models;
    return selectedBrand.models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedBrand, searchTerm]);

  // Filter motorisations based on search term
  const filteredMotorisations = useMemo(() => {
    if (!selectedModel) return [];
    if (!searchTerm) return selectedModel.motorisations;
    return selectedModel.motorisations.filter(motorisation =>
      motorisation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorisation.engine.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedModel, searchTerm]);

  const handleBrandSelect = (brand: Brand) => {
    setAnimationDirection('forward');
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedMotorisation(null);
    setStep('model');
    setSearchTerm("");
  };

  const handleModelSelect = (model: Model) => {
    setAnimationDirection('forward');
    setSelectedModel(model);
    setSelectedMotorisation(null);
    setStep('motorisation');
    setSearchTerm("");
  };

  const handleMotorisationSelect = (motorisation: Motorisation) => {
    setSelectedMotorisation(motorisation);
  };

  const resetSelection = () => {
    setAnimationDirection('backward');
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedMotorisation(null);
    setStep('brand');
    setSearchTerm("");
  };

  const goBack = () => {
    setAnimationDirection('backward');
    if (step === 'motorisation') {
      setSelectedModel(null);
      setSelectedMotorisation(null);
      setStep('model');
    } else if (step === 'model') {
      setSelectedBrand(null);
      setSelectedModel(null);
      setStep('brand');
    }
    setSearchTerm("");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
      {/* Modern Progress Indicator */}
      <div className="relative w-full">
        <div className="flex items-center justify-between mb-4 w-full">
          <div className="flex items-center space-x-4 sm:space-x-8 overflow-x-auto pb-2">
            {['brand', 'model', 'motorisation'].map((stepName, index) => {
              const stepKey = stepName as 'brand' | 'model' | 'motorisation';
              const isActive = step === stepKey;
              const isCompleted = 
                (stepKey === 'brand' && selectedBrand) ||
                (stepKey === 'model' && selectedModel) ||
                (stepKey === 'motorisation' && selectedMotorisation);
              const isAccessible = 
                stepKey === 'brand' || 
                (stepKey === 'model' && selectedBrand) ||
                (stepKey === 'motorisation' && selectedModel);

              return (
                <div key={stepName} className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isActive && "bg-primary text-primary-foreground shadow-lg scale-110",
                    isCompleted && !isActive && "bg-primary/20 text-primary border-2 border-primary",
                    !isActive && !isCompleted && !isAccessible && "bg-muted text-muted-foreground",
                    !isActive && !isCompleted && isAccessible && "bg-background border-2 border-muted text-muted-foreground hover:border-primary/50 cursor-pointer"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                      isActive && "text-primary",
                      isCompleted && !isActive && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {stepKey === 'brand' && 'Marque'}
                      {stepKey === 'model' && 'Modèle'}
                      {stepKey === 'motorisation' && 'Motorisation'}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-muted-foreground truncate max-w-20 sm:max-w-32">
                        {stepKey === 'brand' && selectedBrand?.name}
                        {stepKey === 'model' && (selectedModel?.name && selectedModel.name.length > 20 ? selectedModel.name.substring(0, 20) + '...' : selectedModel?.name)}
                        {stepKey === 'motorisation' && selectedMotorisation?.engine}
                      </span>
                    )}
                  </div>
                  {index < 2 && (
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-colors",
                      isCompleted ? "text-primary" : "text-muted-foreground"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {step !== 'brand' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goBack} 
                className="gap-2 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetSelection}
              className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Recommencer
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${
                step === 'brand' ? '33%' : 
                step === 'model' ? '66%' : 
                '100%'
              }` 
            }}
          />
        </div>
      </div>

      {/* Selection summary */}
      {(selectedBrand || selectedModel || selectedMotorisation) && (
        <Card className="bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Car className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <div className="flex-1">
                <div className="font-medium text-slate-700 dark:text-slate-200">
                  {selectedBrand?.name}
                  {selectedModel && ` ${selectedModel.name}`}
                </div>
                {selectedMotorisation && (
                  <div className="text-sm text-muted-foreground flex items-center space-x-4 mt-1">
                    <span className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>{selectedMotorisation.engine}</span>
                    </span>
                    {selectedMotorisation.power && (
                      <span className="flex items-center space-x-1">
                        <Fuel className="h-3 w-3" />
                        <span>{selectedMotorisation.power} CH</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Search */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200/30 to-slate-300/30 dark:from-slate-700/30 dark:to-slate-600/30 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
          <Input
            placeholder={
              step === 'brand' ? "Rechercher une marque..." :
              step === 'model' ? "Rechercher un modèle..." :
              "Rechercher une motorisation..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 h-12 text-base input-enhanced hover:border-slate-400 dark:hover:border-slate-500 focus:border-slate-600 dark:focus:border-slate-400 focus-ring"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            >
              ×
            </Button>
          )}
        </div>
        
        {/* Search suggestions */}
        {searchTerm && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-background/95 backdrop-blur-sm border border-muted rounded-lg shadow-lg z-10 animate-slide-in">
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-2">
                {step === 'brand' && `${filteredBrands.length} marque${filteredBrands.length !== 1 ? 's' : ''} trouvée${filteredBrands.length !== 1 ? 's' : ''}`}
                {step === 'model' && `${filteredModels.length} modèle${filteredModels.length !== 1 ? 's' : ''} trouvé${filteredModels.length !== 1 ? 's' : ''}`}
                {step === 'motorisation' && `${filteredMotorisations.length} motorisation${filteredMotorisations.length !== 1 ? 's' : ''} trouvée${filteredMotorisations.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Brand selection */}
      {!isLoading && step === 'brand' && (
        <div className={cn(
          "car-selector-grid brand-grid transition-all duration-500",
          animationDirection === 'forward' ? "animate-slide-in" : "animate-fade-in"
        )}>
          {filteredBrands.map((brand, index) => {
            const logoSrc = brand.photo || brand.logo || '/brands/default.png';
            return (
              <Card
                key={brand.id}
                className={cn(
                  "group cursor-pointer card-enhanced",
                  "bg-gradient-to-br from-background to-muted/20 border-2 hover:border-primary/50",
                  "dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800/50",
                  "hover:shadow-xl hover:scale-105 transition-all duration-300",
                  "dark:hover:shadow-primary/25"
                )}
                onClick={() => handleBrandSelect(brand)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 p-4 rounded-2xl bg-background dark:bg-slate-800 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Image
                        src={logoSrc}
                        alt={`${brand.name} logo`}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                        priority
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {brand.models?.length || 0} modèle{(brand.models?.length || 0) !== 1 ? 's' : ''} disponible{(brand.models?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs text-muted-foreground">
                      Cliquez pour explorer
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Model selection */}
      {!isLoading && step === 'model' && selectedBrand && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image
                src={brandLogos[selectedBrand.name] || '/brands/default.png'}
                alt={selectedBrand.name}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{selectedBrand.name}</h3>
              <p className="text-sm text-muted-foreground">Choisissez votre modèle</p>
            </div>
          </div>
          
          <div className={cn(
            "space-y-3 transition-all duration-500 w-full max-w-4xl mx-auto",
            animationDirection === 'forward' ? "animate-slide-in" : "animate-fade-in"
          )}>
            {filteredModels.map((model, index) => (
              <Card
                key={model.id}
                className={cn(
                  "group cursor-pointer card-enhanced w-full",
                  "dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700/50",
                  "hover:shadow-lg hover:scale-[1.01] transition-all duration-300",
                  "border-2 hover:border-slate-400 bg-gradient-to-r from-slate-50 to-slate-100",
                  "dark:border-slate-600 border-slate-300"
                )}
                onClick={() => handleModelSelect(model)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {model.name}
                      </h4>
                      <div className="flex items-center space-x-4">
                        {(model.startYear || model.endYear) && (
                          <span className="flex items-center space-x-1 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full text-xs">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {model.startYear && model.endYear
                                ? `${model.startYear} - ${model.endYear}`
                                : model.startYear
                                ? `Depuis ${model.startYear}`
                                : `Jusqu'en ${model.endYear}`}
                            </span>
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {model.motorisations?.length || 0} motorisation{(model.motorisations?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Motorisation selection */}
      {!isLoading && step === 'motorisation' && selectedModel && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image
                src={brandLogos[selectedBrand?.name || ''] || '/brands/default.png'}
                alt={selectedBrand?.name || ''}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{selectedModel.name}</h3>
              <p className="text-sm text-muted-foreground">Sélectionnez la motorisation</p>
            </div>
          </div>
          
          <div className={cn(
            "space-y-3 transition-all duration-500 w-full max-w-5xl mx-auto",
            animationDirection === 'forward' ? "animate-slide-in" : "animate-fade-in"
          )}>
            {filteredMotorisations.map((motorisation, index) => {
              const isSelected = selectedMotorisation?.id === motorisation.id;
              return (
                <Card
                  key={motorisation.id}
                  className={cn(
                    "group cursor-pointer card-enhanced transition-all duration-300 w-full",
                    "border-2",
                    "dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700/50",
                    isSelected 
                      ? "ring-2 ring-slate-500 bg-slate-100 dark:bg-slate-700/80 border-slate-500 shadow-lg" 
                      : "hover:border-slate-400 hover:scale-[1.01] hover:shadow-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-600 border-slate-300"
                  )}
                  onClick={() => handleMotorisationSelect(motorisation)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={cn(
                            "text-lg font-semibold transition-colors",
                            isSelected ? "text-slate-700 dark:text-slate-200" : "group-hover:text-slate-700 dark:group-hover:text-slate-200"
                          )}>
                            {motorisation.engine}
                          </h4>
                          {isSelected && (
                            <div className="w-6 h-6 bg-slate-600 dark:bg-slate-400 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white dark:text-slate-900" />
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-slate-500 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">Moteur:</span>
                            <span className="text-sm font-medium">{motorisation.engine}</span>
                          </div>
                          
                          {motorisation.power && (
                            <div className="flex items-center space-x-2">
                              <Fuel className="h-4 w-4 text-slate-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">Puissance:</span>
                              <span className="text-sm font-medium">{motorisation.power} CH</span>
                            </div>
                          )}
                          
                          {motorisation.displacement && (
                            <div className="flex items-center space-x-2">
                              <Car className="h-4 w-4 text-slate-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">Cylindrée:</span>
                              <span className="text-sm font-medium">{motorisation.displacement}L</span>
                            </div>
                          )}
                        </div>
                        
                        <div className={cn(
                          "mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 transition-opacity",
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isSelected ? "✓ Sélectionné" : "Cliquez pour sélectionner"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {selectedMotorisation && (
            <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-600 dark:bg-slate-400 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200">Sélection terminée !</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedBrand?.name} {selectedModel.name} - {selectedMotorisation.engine}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty states */}
      {!isLoading && (
        <>
          {step === 'brand' && filteredBrands.length === 0 && (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune marque trouvée</h3>
              <p className="text-muted-foreground">
                Essayez un autre terme de recherche
              </p>
            </div>
          )}
          {step === 'model' && filteredModels.length === 0 && (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun modèle trouvé</h3>
              <p className="text-muted-foreground">
                Aucun modèle disponible pour cette marque
              </p>
            </div>
          )}
          {step === 'motorisation' && filteredMotorisations.length === 0 && (
            <div className="text-center py-12">
              <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune motorisation trouvée</h3>
              <p className="text-muted-foreground">
                Aucune motorisation disponible pour ce modèle
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}