import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import AddToCart from "@/components/add-to-cart";
import Link from "next/link";

// This is a Server Component wrapper that renders a Client subcomponent for add-to-cart
export default async function PartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const part = await prisma.part.findUnique({
    where: { id },
    include: { category: { include: { parent: true } } },
  });
  if (!part) return notFound();

  return (
    <div className="section-container py-8">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/">Accueil</Link> {" / "}
        <span>{part.category?.parent?.name}</span> {" / "}
        <span>{part.category?.name}</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="aspect-square w-full bg-muted rounded-xl flex items-center justify-center overflow-hidden">
              {part.images && part.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={part.images[0]} alt={part.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold leading-tight">{part.name}</h1>
              <p className="text-sm text-muted-foreground">{part.category?.parent?.name} › {part.category?.name}</p>
            </div>
            <div className="text-3xl font-bold text-primary">{formatPrice(Number(part.price))}</div>
            {part.partNumber && (
              <div className="text-xs text-muted-foreground">Référence: {part.partNumber}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <AddToCart id={part.id} name={part.name} price={Number(part.price)} image={part.images?.[0]} partNumber={part.partNumber || undefined} />
              <Link href="/cart">
                <button className="h-10 px-4 rounded-md border">Voir le panier</button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


