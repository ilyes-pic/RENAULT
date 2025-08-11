"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Package, Building2, Car, Tag, Zap, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  parent?: {
    id: string;
    name: string;
  };
}

interface Brand {
  id: string;
  name: string;
  logo?: string;
  photo?: string;
}

interface Model {
  id: string;
  name: string;
  brand: Brand;
}

interface Motorisation {
  id: string;
  name: string;
  engine: string;
  model: Model;
}

export default function NewPartPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [motorisations, setMotorisations] = useState<Motorisation[]>([]);
  const [allMotorisations, setAllMotorisations] = useState<Motorisation[]>([]); // Global store for all selected motorisations
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    description: "",
    price: "",
    categoryId: "",
    manufacturer: "",
    engineCode: "",
    capacity: "",
    temperatureRange: "",
    color: "",
    material: "",
    chemicalProperties: "",
    stockQuantity: "0",
    availability: "IN_STOCK",
    warranty: "",
    weight: "",
    dimensions: "",
    motorisationIds: [] as string[]
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands')
      ]);

      if (categoriesRes.ok) {
        const categoriesResult = await categoriesRes.json();
        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        }
      }

      if (brandsRes.ok) {
        const brandsResult = await brandsRes.json();
        if (brandsResult.success) {
          setBrands(brandsResult.data.brands);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchModels = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/models?brandId=${brandId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setModels(result.data.models);
          setMotorisations([]);
          setSelectedModel("");
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchMotorisations = async (modelId: string) => {
    try {
      const response = await fetch(`/api/admin/motorisations?modelId=${modelId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const newMotorisations = result.data.motorisations;
          setMotorisations(newMotorisations);
          
          // Add new motorisations to allMotorisations if not already present
          setAllMotorisations(prev => {
            const existingIds = prev.map(m => m.id);
            const toAdd = newMotorisations.filter((m: Motorisation) => !existingIds.includes(m.id));
            return [...prev, ...toAdd];
          });
        }
      }
    } catch (error) {
      console.error('Error fetching motorisations:', error);
    }
  };

  // Helper to build API image URL that finds the first webp in the folder
  const getCategoryImageApiUrl = (parentName?: string, categoryName?: string): string => {
    if (!parentName || !categoryName) return "";
    const params = new URLSearchParams({ parent: parentName, name: categoryName });
    return `/api/category-image?${params.toString()}`;
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel("");
    // Don't reset selected motorisations - allow cross-brand selection
    
    if (brandId) {
      fetchModels(brandId);
    } else {
      setModels([]);
      setMotorisations([]);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    // Don't reset selected motorisations - allow adding from multiple models
    
    if (modelId) {
      fetchMotorisations(modelId);
    } else {
      setMotorisations([]);
    }
  };

  const handleMotorisationToggle = (motorisationId: string) => {
    setFormData(prev => ({
      ...prev,
      motorisationIds: prev.motorisationIds.includes(motorisationId)
        ? prev.motorisationIds.filter(id => id !== motorisationId)
        : [...prev.motorisationIds, motorisationId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.partNumber || !formData.price || !formData.categoryId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    
    try {
      // First, upload images if any
      let imageUrls: string[] = [];
      
      if (selectedImages.length > 0) {
        const formDataImages = new FormData();
        selectedImages.forEach((file, index) => {
          formDataImages.append(`image_${index}`, file);
        });

        const imageResponse = await fetch('/api/admin/parts/upload-images', {
          method: 'POST',
          body: formDataImages
        });

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          imageUrls = imageResult.imageUrls || [];
        } else {
          alert("Erreur lors du téléchargement des images");
          return;
        }
      }

      // Then create the part with image URLs
      const response = await fetch('/api/admin/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          images: imageUrls
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Cleanup preview URLs
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        alert('Pièce créée avec succès !');
        router.push('/admin/parts');
      } else {
        alert(result.error || 'Erreur lors de la création de la pièce');
      }
    } catch (error) {
      console.error('Error creating part:', error);
      alert('Erreur lors de la création de la pièce');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 5 images total
    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      alert("Vous ne pouvez sélectionner que 5 images maximum");
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...files]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    // Cleanup the preview URL
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Get subcategories for display
  const subcategories = categories.filter(cat => cat.parent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <Link href="/admin/parts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nouvelle pièce détachée</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ajoutez une nouvelle pièce à votre inventaire
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Informations de base</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom de la pièce *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Joint d'étanchéité, carter d'huile VICTOR REINZ"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Numéro de pièce *</label>
                <Input
                  value={formData.partNumber}
                  onChange={(e) => handleInputChange('partNumber', e.target.value)}
                  placeholder="Ex: 70-31414-10"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description détaillée de la pièce..."
                  rows={3}
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="text-sm font-medium mb-2 block">Images de la pièce</label>
                <div className="space-y-3">
                  {/* Image Preview Grid */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  {selectedImages.length < 5 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Cliquez pour ajouter des images
                        </span>
                        <span className="text-xs text-gray-500">
                          {selectedImages.length}/5 images sélectionnées
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prix (€) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Fabricant</label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="Ex: VICTOR REINZ"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Catégorie de pièce *</span>
                </label>
                
                {formData.categoryId && (
                  <div className="mb-3">
                    {(() => {
                      const selectedCategory = subcategories.find(cat => cat.id === formData.categoryId);
                      return selectedCategory ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                Catégorie sélectionnée:
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInputChange('categoryId', '')}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                              title="Changer de catégorie"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-2 flex items-center space-x-3">
                            <img
                              src={getCategoryImageApiUrl(selectedCategory.parent?.name, selectedCategory.name)}
                              alt={`${selectedCategory.parent?.name || ''} ${selectedCategory.name}`}
                              className="w-10 h-10 object-contain rounded-md bg-white/50 dark:bg-black/20 border"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="font-semibold text-green-800 dark:text-green-200">
                              {selectedCategory.parent?.name}
                            </span>
                            <span className="mx-2 text-green-600 dark:text-green-400">›</span>
                            <span className="font-medium text-green-700 dark:text-green-300">
                              {selectedCategory.name}
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {!formData.categoryId && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-foreground">Choisir une catégorie</span>
                        <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                          Requis
                        </span>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {(() => {
                          // Group categories by parent
                          const groupedCategories = subcategories.reduce((acc: { [key: string]: typeof subcategories }, category) => {
                            const parentName = category.parent?.name || 'Autres';
                            if (!acc[parentName]) acc[parentName] = [];
                            acc[parentName].push(category);
                            return acc;
                          }, {});

                          return Object.entries(groupedCategories).map(([parentName, cats]) => (
                            <div key={parentName} className="mb-3 last:mb-0">
                              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 py-1 bg-muted/50 rounded">
                                {parentName}
                              </div>
                              <div className="space-y-1">
                                {cats.map(category => (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleInputChange('categoryId', category.id)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800 group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-7 h-7 rounded bg-white/50 dark:bg-black/20 border overflow-hidden flex items-center justify-center">
                                          <img
                                            src={getCategoryImageApiUrl(category.parent?.name, category.name)}
                                            alt={`${category.parent?.name || ''} ${category.name}`}
                                            className="w-full h-full object-contain"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                          />
                                        </div>
                                        <span className="font-medium text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                          {category.name}
                                        </span>
                                      </div>
                                      <svg className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Spécifications techniques</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code moteur</label>
                <Input
                  value={formData.engineCode}
                  onChange={(e) => handleInputChange('engineCode', e.target.value)}
                  placeholder="Ex: BHY (DV6FD)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Capacité</label>
                  <Input
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Ex: 70 ml"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Couleur</label>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Ex: anthracite"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Plage de température</label>
                <Input
                  value={formData.temperatureRange}
                  onChange={(e) => handleInputChange('temperatureRange', e.target.value)}
                  placeholder="Ex: 50 °C, jusqu'à 320 °C"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Matériel</label>
                <Input
                  value={formData.material}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  placeholder="Ex: Silicone"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Propriétés chimiques</label>
                <Textarea
                  value={formData.chemicalProperties}
                  onChange={(e) => handleInputChange('chemicalProperties', e.target.value)}
                  placeholder="Ex: ne contient pas de solvant, mastic, durcissant"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Inventaire</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantité en stock</label>
                  <Input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Disponibilité</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="IN_STOCK">En stock</option>
                    <option value="OUT_OF_STOCK">Rupture de stock</option>
                    <option value="PREORDER">Pré-commande</option>
                    <option value="DISCONTINUED">Arrêté</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Garantie (mois)</label>
                  <Input
                    type="number"
                    value={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Poids (kg)</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="0.000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Dimensions (LxlxH cm)</label>
                <Input
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="Ex: 15x10x5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Compatibility */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Compatibilité véhicules</span>
                </div>
                {formData.motorisationIds.length > 0 && (
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {formData.motorisationIds.length} sélectionnée(s)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Selected Motorisations Grid */}
              {formData.motorisationIds.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Motorisations compatibles sélectionnées</h3>
                  <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                    {allMotorisations
                      .filter(m => formData.motorisationIds.includes(m.id))
                      .map(motorisation => (
                        <div key={motorisation.id} className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <img
                                  src={motorisation.model.brand.photo || '/brands/' + motorisation.model.brand.name.toLowerCase() + '.png'}
                                  alt={motorisation.model.brand.name}
                                  className="w-5 h-5 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm">
                                  {motorisation.model.brand.name}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                                {motorisation.model.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 rounded px-2 py-1 mt-1 inline-block">
                                {motorisation.engine}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleMotorisationToggle(motorisation.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full p-1"
                              title="Retirer cette motorisation"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Multi-Brand Selection Interface */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-foreground">Ajouter des motorisations</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    Compatible multi-marques
                  </span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Brand Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">1. Choisir une marque</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Toutes les marques...</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      2. Choisir un modèle
                      {selectedBrand && models.length === 0 && (
                        <span className="text-xs text-muted-foreground ml-2">(Aucun modèle trouvé)</span>
                      )}
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      disabled={!selectedBrand || models.length === 0}
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Sélectionner un modèle...</option>
                      {models.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Motorisations Selection */}
                {selectedModel && motorisations.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      3. Sélectionner les motorisations
                      <span className="text-xs text-muted-foreground ml-2">
                        ({motorisations.length} disponible(s))
                      </span>
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950">
                      {motorisations.map(motorisation => {
                        const isSelected = formData.motorisationIds.includes(motorisation.id);
                        return (
                          <label 
                            key={motorisation.id} 
                            className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleMotorisationToggle(motorisation.id)}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-foreground">
                                {motorisation.engine}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {motorisation.name}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="text-green-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Compatibilité multi-marques activée</p>
                      <p>Vous pouvez changer de marque et modèle pour ajouter d'autres motorisations compatibles. Les sélections précédentes seront conservées.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
          <Link href="/admin/parts">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Création...' : 'Créer la pièce'}
          </Button>
        </div>
      </form>
    </div>
  );
}