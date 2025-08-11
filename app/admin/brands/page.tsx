"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronRight, Check, ArrowLeft, Plus, Trash2, Car, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Brand {
  id: string;
  name: string;
  logo?: string;
  photo?: string;
  description?: string;
  country?: string;
  founded?: number;
  models: Model[];
  _count?: {
    models: number;
  };
}

interface Model {
  id: string;
  name: string;
  startYear?: number;
  endYear?: number;
  bodyType?: string;
  brand: Brand;
  motorisations: Motorisation[];
  _count?: {
    motorisations: number;
  };
}

interface Motorisation {
  id: string;
  name: string;
  engine: string;
  power?: number;
  displacement?: number;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  model: Model;
}

interface BrandFormData {
  name: string;
  country: string;
  founded: string;
  description: string;
  photo: string;
}

interface ModelFormData {
  name: string;
  startYear: string;
  endYear: string;
  bodyType: string;
}

interface MotorisationFormData {
  name: string;
  engine: string;
  power: string;
  displacement: string;
  fuelType: string;
  transmission: string;
  driveType: string;
}

export default function VehicleManagement() {
  // State management
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedMotorisation, setSelectedMotorisation] = useState<Motorisation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'brand' | 'model' | 'motorisation'>('brand');
  // Dialog states
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [motorisationDialogOpen, setMotorisationDialogOpen] = useState(false);

  // Form states
  const [brandFormData, setBrandFormData] = useState<BrandFormData>({
    name: "", country: "", founded: "", description: "", photo: ""
  });
  const [modelFormData, setModelFormData] = useState<ModelFormData>({
    name: "", startYear: "", endYear: "", bodyType: ""
  });
  const [motorisationFormData, setMotorisationFormData] = useState<MotorisationFormData>({
    name: "", engine: "", power: "", displacement: "", fuelType: "", transmission: "", driveType: ""
  });

  // Loading states
  const [isSaving, setIsSaving] = useState(false);

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/brands');
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        if (result.success && result.data && Array.isArray(result.data.brands)) {
          setBrands(result.data.brands);
        } else if (result.success && Array.isArray(result.data)) {
          // Fallback for different API response format
          setBrands(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModelsForBrand = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/models?brandId=${brandId}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Models API Response for brand', brandId, ':', result); // Debug log
        if (result.success) {
          // Handle nested data structure from API
          const models = result.data && result.data.models ? result.data.models : (result.data || []);
          console.log('Extracted models:', models.length, 'models'); // Debug log
          
          // Update selectedBrand state using current state, not the captured closure
          setSelectedBrand(currentBrand => {
            if (currentBrand && currentBrand.id === brandId) {
              const updatedBrand = { ...currentBrand, models: models };
              console.log('Updated brand in setState:', updatedBrand); // Debug log
              
              // Also update the brands array
              setBrands(prev => prev.map(b => b.id === brandId ? updatedBrand : b));
              
              return updatedBrand;
            }
            return currentBrand;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchMotorisationsForModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/admin/motorisations?modelId=${modelId}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Motorisations API Response for model', modelId, ':', result); // Debug log
        console.log('Full motorisations response structure:', JSON.stringify(result, null, 2)); // Debug log
        if (result.success) {
          console.log('result.success is true'); // Debug log
          console.log('result.data:', result.data); // Debug log
          console.log('result.data.motorisations:', result.data?.motorisations); // Debug log
          // Handle nested data structure from API
          const motorisations = result.data && result.data.motorisations ? result.data.motorisations : (result.data || []);
          console.log('Extracted motorisations:', motorisations.length, 'motorisations'); // Debug log
          
          // Update selectedModel state using current state, not the captured closure
          setSelectedModel(currentModel => {
            if (currentModel && currentModel.id === modelId) {
              const updatedModel = { ...currentModel, motorisations: motorisations };
              console.log('Updated model in setState:', updatedModel); // Debug log
              
              // Also update the selectedBrand to reflect the updated model
              setSelectedBrand(currentBrand => {
                if (currentBrand && currentBrand.models) {
                  const updatedBrand = {
                    ...currentBrand,
                    models: currentBrand.models.map(m => m.id === modelId ? updatedModel : m)
                  };
                  console.log('Updated brand with model in setState:', updatedBrand); // Debug log
                  return updatedBrand;
                }
                return currentBrand;
              });
              
              return updatedModel;
            }
            return currentModel;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching motorisations:', error);
    }
  };

  // Filter functions
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands;
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  const filteredModels = useMemo(() => {
    console.log('Computing filteredModels...'); // Debug log
    console.log('selectedBrand:', selectedBrand); // Debug log
    if (!selectedBrand) {
      console.log('No selectedBrand, returning []'); // Debug log
      return [];
    }
    if (!selectedBrand.models || !Array.isArray(selectedBrand.models)) {
      console.log('No models array or not array, returning []'); // Debug log
      console.log('selectedBrand.models:', selectedBrand.models); // Debug log
      return [];
    }
    const result = !searchTerm ? selectedBrand.models : selectedBrand.models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log('filteredModels result:', result.length, 'models'); // Debug log
    return result;
  }, [selectedBrand, searchTerm]);

  const filteredMotorisations = useMemo(() => {
    if (!selectedModel) return [];
    if (!selectedModel.motorisations || !Array.isArray(selectedModel.motorisations)) return [];
    if (!searchTerm) return selectedModel.motorisations;
    return selectedModel.motorisations.filter(motorisation =>
      motorisation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorisation.engine.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedModel, searchTerm]);

  // Navigation functions
  const handleBrandSelect = async (brand: Brand) => {
    // Ensure models array is initialized
    const brandWithModels = { ...brand, models: brand.models || [] };
    setSelectedBrand(brandWithModels);
    setSelectedModel(null);
    setSelectedMotorisation(null);
    setStep('model');
    setSearchTerm("");
    await fetchModelsForBrand(brand.id);
  };

  const handleModelSelect = async (model: Model) => {
    // Ensure motorisations array is initialized
    const modelWithMotorisations = { ...model, motorisations: model.motorisations || [] };
    setSelectedModel(modelWithMotorisations);
    setSelectedMotorisation(null);
    setStep('motorisation');
    setSearchTerm("");
    await fetchMotorisationsForModel(model.id);
  };

  const handleMotorisationSelect = (motorisation: Motorisation) => {
    setSelectedMotorisation(motorisation);
  };

  const resetSelection = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedMotorisation(null);
    setStep('brand');
    setSearchTerm("");
  };

  const goBack = () => {
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

  // CRUD operations
  const handleCreateModel = async () => {
    if (!selectedBrand) return;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modelFormData,
          brandId: selectedBrand.id,
          startYear: modelFormData.startYear ? parseInt(modelFormData.startYear) : null,
          endYear: modelFormData.endYear ? parseInt(modelFormData.endYear) : null
        })
      });
      
      if (response.ok) {
        setModelDialogOpen(false);
        setModelFormData({ name: "", startYear: "", endYear: "", bodyType: "" });
        await fetchModelsForBrand(selectedBrand.id);
      } else {
        console.error('Error creating model');
      }
    } catch (error) {
      console.error('Error creating model:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'DELETE',
      });
      
      if (response.ok && selectedBrand) {
        await fetchModelsForBrand(selectedBrand.id);
      } else {
        console.error('Error deleting model');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateMotorisation = async () => {
    if (!selectedModel) return;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/motorisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...motorisationFormData,
          modelId: selectedModel.id,
          power: motorisationFormData.power ? parseInt(motorisationFormData.power) : null,
          displacement: motorisationFormData.displacement ? parseFloat(motorisationFormData.displacement) : null
        })
      });
      
      if (response.ok) {
        setMotorisationDialogOpen(false);
        setMotorisationFormData({ name: "", engine: "", power: "", displacement: "", fuelType: "", transmission: "", driveType: "" });
        await fetchMotorisationsForModel(selectedModel.id);
      } else {
        console.error('Error creating motorisation');
      }
    } catch (error) {
      console.error('Error creating motorisation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMotorisation = async (motorisationId: string) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/motorisations/${motorisationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok && selectedModel) {
        await fetchMotorisationsForModel(selectedModel.id);
      } else {
        console.error('Error deleting motorisation');
      }
    } catch (error) {
      console.error('Error deleting motorisation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBrand = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...brandFormData,
          founded: brandFormData.founded ? parseInt(brandFormData.founded) : undefined
        })
      });
      
      if (response.ok) {
        setBrandDialogOpen(false);
        setBrandFormData({ name: "", country: "", founded: "", description: "", photo: "" });
        await fetchBrands();
      }
    } catch (error) {
      console.error('Error creating brand:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchBrands();
        if (selectedBrand?.id === brandId) {
          resetSelection();
        }
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestion des Véhicules</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gérez vos marques, modèles et motorisations de véhicules
        </p>
      </div>

      {/* Progress Indicator */}
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

              return (
                <div key={stepName} className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isActive && "bg-primary text-primary-foreground shadow-lg scale-110",
                    isCompleted && !isActive && "bg-primary/20 text-primary border-2 border-primary",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
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
                      {stepKey === 'brand' && 'Marques'}
                      {stepKey === 'model' && 'Modèles'}
                      {stepKey === 'motorisation' && 'Motorisations'}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-muted-foreground truncate max-w-20 sm:max-w-32">
                        {stepKey === 'brand' && selectedBrand?.name}
                        {stepKey === 'model' && selectedModel?.name}
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
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetSelection}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={
            step === 'brand' ? "Rechercher une marque..." :
            step === 'model' ? "Rechercher un modèle..." :
            "Rechercher une motorisation..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-4 h-12"
        />
      </div>

      {/* Loading State */}
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

      {/* Brand Selection */}
      {!isLoading && step === 'brand' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Marques ({filteredBrands.length})</h2>
            <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setBrandFormData({ name: "", country: "", founded: "", description: "", photo: "" });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une marque
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle marque</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle marque de véhicule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom *</label>
                    <Input
                      value={brandFormData.name}
                      onChange={(e) => setBrandFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Toyota"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pays</label>
                    <Input
                      value={brandFormData.country}
                      onChange={(e) => setBrandFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Ex: Japon"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateBrand} disabled={isSaving}>
                    {isSaving ? 'Création...' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredBrands.map((brand) => {
              const logoSrc = brand.photo || brand.logo || '/brands/default.png';
              return (
                <Card
                  key={brand.id}
                  className="group cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-2xl bg-background shadow-lg">
                        <Image
                          src={logoSrc}
                          alt={`${brand.name} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Admin Actions */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la marque</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer "{brand.name}" ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBrand(brand.id)} className="bg-red-500 hover:bg-red-600">
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="space-y-2" onClick={() => handleBrandSelect(brand)}>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {brand._count?.models || brand.models?.length || 0} modèle{((brand._count?.models || brand.models?.length || 0) !== 1) ? 's' : ''}
                      </p>
                      {brand.country && brand.founded && (
                        <p className="text-xs text-muted-foreground">
                          {brand.country} • {brand.founded}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Model Selection */}
      {!isLoading && step === 'model' && selectedBrand && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image
                src={selectedBrand.photo || selectedBrand.logo || '/brands/default.png'}
                alt={selectedBrand.name}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{selectedBrand.name}</h3>
              <p className="text-sm text-muted-foreground">Modèles disponibles</p>
            </div>
          </div>

          {/* Add Model Button */}
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer" onClick={() => setModelDialogOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Ajouter un nouveau modèle</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredModels.map((model) => (
              <Card
                key={model.id}
                className="group cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex-1" onClick={() => handleModelSelect(model)}>
                    <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {model.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {model._count?.motorisations || model.motorisations?.length || 0} motorisation{((model._count?.motorisations || model.motorisations?.length || 0) !== 1) ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le modèle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le modèle &quot;{model.name}&quot; ? Cette action est irréversible et supprimera également toutes les motorisations associées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteModel(model.id)}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Motorisation Selection */}
      {!isLoading && step === 'motorisation' && selectedModel && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image
                src={selectedBrand?.photo || selectedBrand?.logo || '/brands/default.png'}
                alt={selectedBrand?.name || ''}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{selectedModel.name}</h3>
              <p className="text-sm text-muted-foreground">Motorisations disponibles</p>
            </div>
          </div>

          {/* Add Motorisation Button */}
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer" onClick={() => setMotorisationDialogOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Ajouter une nouvelle motorisation</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredMotorisations.map((motorisation) => {
              const isSelected = selectedMotorisation?.id === motorisation.id;
              return (
                <Card
                  key={motorisation.id}
                  className={cn(
                    "group cursor-pointer transition-all duration-300",
                    isSelected 
                      ? "ring-2 ring-primary bg-primary/5 shadow-lg" 
                      : "hover:shadow-lg hover:scale-[1.01]"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1" onClick={() => handleMotorisationSelect(motorisation)}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold">
                            {motorisation.engine}
                          </h4>
                          {isSelected && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {motorisation.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la motorisation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer la motorisation &quot;{motorisation.engine}&quot; ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteMotorisation(motorisation.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedMotorisation && (
            <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Motorisation sélectionnée</h4>
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
                {searchTerm ? "Essayez un autre terme de recherche" : "Commencez par ajouter une marque"}
              </p>
            </div>
          )}
          {step === 'model' && filteredModels.length === 0 && (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun modèle trouvé</h3>
              <p className="text-muted-foreground">
                Cette marque n'a pas encore de modèles
              </p>
            </div>
          )}
          {step === 'motorisation' && filteredMotorisations.length === 0 && (
            <div className="text-center py-12">
              <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune motorisation trouvée</h3>
              <p className="text-muted-foreground">
                Ce modèle n'a pas encore de motorisations
              </p>
            </div>
          )}
        </>
      )}

      {/* Model Dialog */}
      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau modèle</DialogTitle>
            <DialogDescription>
              Créer un nouveau modèle pour la marque {selectedBrand?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom du modèle</label>
              <Input
                value={modelFormData.name}
                onChange={(e) => setModelFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Peugeot 308"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Année de début</label>
                <Input
                  type="number"
                  value={modelFormData.startYear}
                  onChange={(e) => setModelFormData(prev => ({ ...prev, startYear: e.target.value }))}
                  placeholder="2020"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Année de fin</label>
                <Input
                  type="number"
                  value={modelFormData.endYear}
                  onChange={(e) => setModelFormData(prev => ({ ...prev, endYear: e.target.value }))}
                  placeholder="2025"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Type de carrosserie</label>
              <select
                className="w-full p-2 border rounded-md"
                value={modelFormData.bodyType}
                onChange={(e) => setModelFormData(prev => ({ ...prev, bodyType: e.target.value }))}
              >
                <option value="">Sélectionner...</option>
                <option value="HATCHBACK">Berline</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="WAGON">Break</option>
                <option value="COUPE">Coupé</option>
                <option value="CONVERTIBLE">Cabriolet</option>
                <option value="VAN">Utilitaire</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModelDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateModel} disabled={isSaving || !modelFormData.name}>
              {isSaving ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Motorisation Dialog */}
      <Dialog open={motorisationDialogOpen} onOpenChange={setMotorisationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle motorisation</DialogTitle>
            <DialogDescription>
              Créer une nouvelle motorisation pour le modèle {selectedModel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom de la motorisation</label>
              <Input
                value={motorisationFormData.name}
                onChange={(e) => setMotorisationFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: 1.2 PureTech 110"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Moteur</label>
              <Input
                value={motorisationFormData.engine}
                onChange={(e) => setMotorisationFormData(prev => ({ ...prev, engine: e.target.value }))}
                placeholder="Ex: 1.2L 3-cylinder turbo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Puissance (ch)</label>
                <Input
                  type="number"
                  value={motorisationFormData.power}
                  onChange={(e) => setMotorisationFormData(prev => ({ ...prev, power: e.target.value }))}
                  placeholder="110"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cylindrée (L)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={motorisationFormData.displacement}
                  onChange={(e) => setMotorisationFormData(prev => ({ ...prev, displacement: e.target.value }))}
                  placeholder="1.2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Type de carburant</label>
              <select
                className="w-full p-2 border rounded-md"
                value={motorisationFormData.fuelType}
                onChange={(e) => setMotorisationFormData(prev => ({ ...prev, fuelType: e.target.value }))}
              >
                <option value="">Sélectionner...</option>
                <option value="GASOLINE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybride</option>
                <option value="ELECTRIC">Électrique</option>
                <option value="PLUG_IN_HYBRID">Hybride rechargeable</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Transmission</label>
              <select
                className="w-full p-2 border rounded-md"
                value={motorisationFormData.transmission}
                onChange={(e) => setMotorisationFormData(prev => ({ ...prev, transmission: e.target.value }))}
              >
                <option value="">Sélectionner...</option>
                <option value="MANUAL">Manuelle</option>
                <option value="AUTOMATIC">Automatique</option>
                <option value="CVT">CVT</option>
                <option value="SEMI_AUTOMATIC">Semi-automatique</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMotorisationDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateMotorisation} disabled={isSaving || !motorisationFormData.name || !motorisationFormData.engine}>
              {isSaving ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
