"use client";
import { useCart } from "@/components/cart-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      // COD: simulate creating an order via API if exists; otherwise just confirm
      // You can wire to /api/orders when implemented
      await new Promise((r) => setTimeout(r, 800));
      setPlaced("Commande confirmée. Paiement à la livraison.");
      clear();
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="section-container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Finaliser la commande</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Coordonnées</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="h-10 rounded border px-3" placeholder="Nom" />
                <input className="h-10 rounded border px-3" placeholder="Prénom" />
                <input className="h-10 rounded border px-3 sm:col-span-2" placeholder="Téléphone" />
                <input className="h-10 rounded border px-3 sm:col-span-2" placeholder="Adresse" />
                <input className="h-10 rounded border px-3" placeholder="Ville" />
                <input className="h-10 rounded border px-3" placeholder="Code Postal" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2">
              <h2 className="font-semibold">Mode de paiement</h2>
              <div className="text-sm text-muted-foreground">Paiement à la livraison (COD)</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Récapitulatif</h3>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{it.name} × {it.quantity}</span>
                  <span>{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Sous-total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <Button disabled={placing || items.length === 0} onClick={placeOrder} className="w-full">
              {placing ? "Confirmation..." : "Confirmer la commande"}
            </Button>
            {placed && <div className="text-green-600 text-sm">{placed}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


