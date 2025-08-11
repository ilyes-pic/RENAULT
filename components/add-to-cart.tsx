"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";

type Props = { id: string; name: string; price: number; image?: string; partNumber?: string };

export default function AddToCart(props: Props) {
  const { addItem } = useCart();
  return (
    <Button onClick={() => addItem(props, 1)} size="lg">
      Ajouter au panier
    </Button>
  );
}


