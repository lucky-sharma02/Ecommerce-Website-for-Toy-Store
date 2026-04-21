import { useState, useEffect } from "react";
import { Product } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag } from "lucide-react";
import { toast } from "sonner";

export default function AdminModeration() {
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
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
          unitPrice: p.unit_price,
          lotSize: p.lot_size,
          lotPrice: p.lot_price,
          stock: p.stock,
          sku: p.sku || "",
          wholesaler: "Unknown"
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error("Backend fetch failed", err));
  }, []);

  const toggleFlag = (id: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Item unflagged"); }
      else { next.add(id); toast.warning("Item flagged for review"); }
      return next;
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Marketplace Moderation</h1>
      <div className="bg-card border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider font-semibold">SKU</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Product</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Wholesaler</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Price</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-center">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className={`text-sm ${flagged.has(p.id) ? "bg-destructive/5" : ""}`}>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.wholesaler}</TableCell>
                <TableCell><Badge variant="secondary" className="rounded-sm text-xs font-normal">{p.category}</Badge></TableCell>
                <TableCell className="text-right font-mono">${p.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  {flagged.has(p.id) ? (
                    <Badge className="rounded-sm bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Flagged</Badge>
                  ) : (
                    <Badge className="rounded-sm bg-success/10 text-success border-success/20 text-[10px]">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={flagged.has(p.id) ? "outline" : "destructive"}
                    size="sm"
                    className="rounded-sm h-7 text-xs"
                    onClick={() => toggleFlag(p.id)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    {flagged.has(p.id) ? "Unflag" : "Flag Item"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
