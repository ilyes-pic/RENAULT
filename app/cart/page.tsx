"use client";
import { useCart } from "@/components/cart-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  return (
    <div className="section-container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Votre panier</h1>
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Votre panier est vide.</p>
            <Link href="/">
              <Button>Continuer vos achats</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {items.map((it) => (
              <Card key={it.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.name} className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.name}</div>
                    {it.partNumber && <div className="text-xs text-muted-foreground">Ref: {it.partNumber}</div>}
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateQty(it.id, it.quantity - 1)}>-</Button>
                      <span className="w-8 text-center">{it.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQty(it.id, it.quantity + 1)}>+</Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(it.price * it.quantity)}</div>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(it.id)} className="mt-2">Retirer</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <Link href="/checkout">
                <Button className="w-full">Passer à la commande</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


