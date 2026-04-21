import { useState, useEffect } from "react";
import { Product } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, Search, Package } from "lucide-react";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
}

export default function RetailerCatalog() {
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/products/")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          category: p.category || "Uncategorized",
          inStock: p.stock > 0,
          description: p.description || "",
          unitPrice: p.unit_price || 0,
          lotSize: p.lot_size || 1,
          lotPrice: p.lot_price || 0
        }));
        setProducts(mapped);
      })
      .catch((err) => {
        console.error("Backend connection failed", err);
      });
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const getQty = (id: string) => quantities[id] || 1;
  const setQty = (id: string, val: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  const addToCart = (product: Product) => {
    const qty = getQty(product.id);
    const existing = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    const idx = existing.findIndex((c) => c.product.id === product.id);
    if (idx >= 0) {
      existing[idx].quantity += qty;
    } else {
      existing.push({ product, quantity: qty });
    }
    localStorage.setItem("cart", JSON.stringify(existing));
    toast.success(`Added ${qty}x ${product.name} to cart`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Browse wholesale toys and add to your order</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="rounded-sm pl-9"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <Card key={p.id} className="rounded-sm border overflow-hidden">
            <div className="bg-muted/50 h-32 flex items-center justify-center border-b">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-semibold leading-tight pr-2">{p.name}</h3>
                {p.inStock ? (
                  <Badge className="rounded-sm bg-success/10 text-success border-success/20 text-[10px] shrink-0">In Stock</Badge>
                ) : (
                  <Badge className="rounded-sm bg-destructive/10 text-destructive border-destructive/20 text-[10px] shrink-0">Out of Stock</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-muted/50 rounded-sm p-2">
                  <p className="text-muted-foreground">Unit Price</p>
                  <p className="font-semibold text-sm">${p.unitPrice.toFixed(2)}</p>
                </div>
                <div className="bg-muted/50 rounded-sm p-2">
                  <p className="text-muted-foreground">Lot ({p.lotSize} units)</p>
                  <p className="font-semibold text-sm">${p.lotPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-sm"
                    onClick={() => setQty(p.id, getQty(p.id) - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">{getQty(p.id)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-sm"
                    onClick={() => setQty(p.id, getQty(p.id) + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  className="rounded-sm flex-1 h-8 text-xs"
                  disabled={!p.inStock}
                  onClick={() => addToCart(p)}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
