"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2, ChevronRight, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

type BodyType =
  | "SEDAN"
  | "HATCHBACK"
  | "SUV"
  | "COUPE"
  | "CONVERTIBLE"
  | "WAGON"
  | "PICKUP"
  | "VAN"
  | "MINIVAN"
  | "CROSSOVER";

interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  photo?: string | null;
}

interface ModelItem {
  id: string;
  name: string;
  generation?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  bodyType?: BodyType | null;
  description?: string | null;
  brand: Brand;
  _count?: { motorisations: number };
}

interface CreateModelForm {
  name: string;
  brandId: string;
  generation: string;
  startYear: string;
  endYear: string;
  bodyType: string;
  description: string;
}

const bodyTypeLabels: Record<string, string> = {
  SEDAN: "Berline",
  HATCHBACK: "Hatchback",
  SUV: "SUV",
  COUPE: "Coupé",
  CONVERTIBLE: "Cabriolet",
  WAGON: "Break",
  PICKUP: "Pickup",
  VAN: "Utilitaire",
  MINIVAN: "Monospace",
  CROSSOVER: "Crossover",
};

export default function ModelsAdminPage() {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedBodyType, setSelectedBodyType] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreateModelForm>({
    name: "",
    brandId: "",
    generation: "",
    startYear: "",
    endYear: "",
    bodyType: "",
    description: "",
  });

  // Initial data
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/admin/brands?limit=500");
        if (res.ok) {
          const result = await res.json();
          const list: Brand[] = result?.data?.brands || result?.data || [];
          setBrands(list);
        }
      } catch (e) {
        console.error("Error fetching brands", e);
      }
    };
    fetchBrands();
  }, []);

  // Fetch models when filters change
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (selectedBrandId) params.set("brandId", selectedBrandId);
        if (selectedBodyType) params.set("bodyType", selectedBodyType);
        params.set("limit", "100");
        const res = await fetch(`/api/admin/models?${params.toString()}`, { signal: controller.signal });
        if (res.ok) {
          const result = await res.json();
          const list: ModelItem[] = result?.data?.models || result?.data || [];
          setModels(list);
        }
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          console.error("Error fetching models", e);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [searchTerm, selectedBrandId, selectedBodyType]);

  const visibleModels = useMemo(() => models, [models]);

  const handleCreateModel = async () => {
    if (!createForm.name || !createForm.brandId) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          brandId: createForm.brandId,
          generation: createForm.generation || undefined,
          startYear: createForm.startYear ? parseInt(createForm.startYear) : undefined,
          endYear: createForm.endYear ? parseInt(createForm.endYear) : undefined,
          bodyType: createForm.bodyType || undefined,
          description: createForm.description || undefined,
        }),
      });
      if (res.ok) {
        setIsCreateDialogOpen(false);
        setCreateForm({ name: "", brandId: selectedBrandId || "", generation: "", startYear: "", endYear: "", bodyType: "", description: "" });
        // Refresh list
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (selectedBrandId) params.set("brandId", selectedBrandId);
        if (selectedBodyType) params.set("bodyType", selectedBodyType);
        params.set("limit", "100");
        const refreshed = await fetch(`/api/admin/models?${params.toString()}`);
        if (refreshed.ok) {
          const result = await refreshed.json();
          setModels(result?.data?.models || result?.data || []);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Create model failed", err);
      }
    } catch (e) {
      console.error("Error creating model", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/models/${modelId}`, { method: "DELETE" });
      if (res.ok) {
        setModels((prev) => prev.filter((m) => m.id !== modelId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "Erreur lors de la suppression du modèle");
      }
    } catch (e) {
      console.error("Error deleting model", e);
      alert("Erreur lors de la suppression du modèle");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des modèles</h1>
          <p className="text-muted-foreground">Parcourez, filtrez, créez et supprimez des modèles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateForm((f) => ({ ...f, brandId: selectedBrandId }))}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau modèle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau modèle</DialogTitle>
              <DialogDescription>Renseignez les informations du modèle</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Marque *</label>
                <select
                  value={createForm.brandId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, brandId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: 308"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Génération</label>
                <Input
                  value={createForm.generation}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, generation: e.target.value }))}
                  placeholder="Ex: II (T9)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Année de début</label>
                  <Input
                    type="number"
                    value={createForm.startYear}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, startYear: e.target.value }))}
                    placeholder="2014"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Année de fin</label>
                  <Input
                    type="number"
                    value={createForm.endYear}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, endYear: e.target.value }))}
                    placeholder="2021"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Type de carrosserie</label>
                <select
                  value={createForm.bodyType}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, bodyType: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {Object.keys(bodyTypeLabels).map((bt) => (
                    <option key={bt} value={bt}>
                      {bodyTypeLabels[bt]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Notes, variantes, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateModel} disabled={isSaving || !createForm.name || !createForm.brandId}>
                {isSaving ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid gap-4 md:grid-cols-7">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un modèle ou une marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={selectedBodyType}
            onChange={(e) => setSelectedBodyType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Tous les types</option>
            {Object.keys(bodyTypeLabels).map((bt) => (
              <option key={bt} value={bt}>
                {bodyTypeLabels[bt]}
              </option>
            ))}
          </select>
          <Card className="p-4"><div className="text-2xl font-bold">{models.length}</div><div className="text-sm text-muted-foreground">Modèles</div></Card>
          <Card className="p-4"><div className="text-2xl font-bold">{models.reduce((s, m) => s + (m._count?.motorisations || 0), 0)}</div><div className="text-sm text-muted-foreground">Motorisations</div></Card>
        </div>
      </div>

      {/* Models Grid */}
      {isLoading ? (
        <div className="grid gap-4 lg:gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
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
          {visibleModels.map((model) => (
            <Card key={model.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {model.brand.photo || model.brand.logo ? (
                        <Image
                          src={model.brand.photo || model.brand.logo || ""}
                          alt={model.brand.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {model.brand.name} {model.name}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {model.generation ? `${model.generation} • ` : ""}
                        {model.startYear || model.endYear ? (
                          <>
                            {model.startYear || "?"} - {model.endYear || "..."}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {model._count?.motorisations || 0} motorisation{(model._count?.motorisations || 0) !== 1 ? "s" : ""}
                    </div>
                    {model.bodyType && (
                      <div className="text-xs text-muted-foreground">{bodyTypeLabels[model.bodyType]}</div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {model.description || ""}
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le modèle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le modèle "{model.brand.name} {model.name}" sera supprimé.
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
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && visibleModels.length === 0 && (
        <Card className="p-12 text-center">
          <CardTitle className="mb-2">Aucun modèle</CardTitle>
          <p className="text-muted-foreground mb-4">Commencez par ajouter votre premier modèle.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un modèle
          </Button>
        </Card>
      )}
    </div>
  );
}


