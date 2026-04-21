import { useState, useEffect } from "react";
import { Product } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Package } from "lucide-react";

export default function WholesalerInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", unitPrice: "", lotPrice: "", lotSize: "", stock: "", category: "", sku: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/products/")
      .then((res) => res.json())
      .then((data) => {
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
          wholesaler: "Me"
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error("Backend fetch failed", err));
  }, []);

  const toggleStock = async (id: string, inStock: boolean) => {
    try {
      // In a real app we might PATCH the stock. For now just optimistic UI updates.
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
      );
    } catch (err) { }
  };

  const resetForm = () => setForm({ name: "", description: "", unitPrice: "", lotPrice: "", lotSize: "", stock: "", category: "", sku: "" });

  const handleCreate = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        unit_price: parseFloat(form.unitPrice) || 0,
        lot_price: parseFloat(form.lotPrice) || 0,
        lot_size: parseInt(form.lotSize) || 1,
        stock: parseInt(form.stock) || 0,
        category: form.category,
        sku: form.sku,
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create product");
      }

      const p = await res.json();
      const newProduct: Product = {
        id: String(p.id),
        name: p.name,
        description: p.description || "",
        unitPrice: p.unit_price,
        lotPrice: p.lot_price,
        lotSize: p.lot_size,
        stock: p.stock,
        inStock: p.stock > 0,
        category: p.category || "Uncategorized",
        wholesaler: "Me",
        sku: p.sku || ""
      };

      setProducts((prev) => [...prev, newProduct]);
      resetForm();
      setCreateOpen(false);
      toast.success("Successfully created product in database!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = async () => {
    if (!editProduct) return;
    try {
      const payload = {
        name: form.name,
        description: form.description,
        unit_price: parseFloat(form.unitPrice) || 0,
        lot_price: parseFloat(form.lotPrice) || 0,
        lot_size: parseInt(form.lotSize) || 1,
        stock: parseInt(form.stock) || 0,
        category: form.category,
        sku: form.sku,
      };

      const res = await fetch(`http://127.0.0.1:8000/api/v1/products/${editProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to edit product");
      const p = await res.json();

      setProducts((prev) =>
        prev.map((pr) =>
          pr.id === editProduct.id
            ? {
              ...pr,
              name: p.name,
              description: p.description || "",
              unitPrice: p.unit_price,
              lotPrice: p.lot_price,
              lotSize: p.lot_size,
              stock: p.stock,
              inStock: p.stock > 0,
              category: p.category,
              sku: p.sku,
            }
            : pr
        )
      );
      setEditProduct(null);
      resetForm();
      toast.success("Product successfully updated!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      unitPrice: String(p.unitPrice),
      lotPrice: String(p.lotPrice),
      lotSize: String(p.lotSize),
      stock: String(p.stock),
      category: p.category,
      sku: p.sku,
    });
  };

  const formFields = (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Product Name</Label><Input className="rounded-sm mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label className="text-xs">SKU</Label><Input className="rounded-sm mt-1" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
      </div>
      <div><Label className="text-xs">Description</Label><Input className="rounded-sm mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-4 gap-3">
        <div><Label className="text-xs">Unit Price ($)</Label><Input className="rounded-sm mt-1" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></div>
        <div><Label className="text-xs">Lot Price ($)</Label><Input className="rounded-sm mt-1" type="number" value={form.lotPrice} onChange={(e) => setForm({ ...form, lotPrice: e.target.value })} /></div>
        <div><Label className="text-xs">Lot Size</Label><Input className="rounded-sm mt-1" type="number" value={form.lotSize} onChange={(e) => setForm({ ...form, lotSize: e.target.value })} /></div>
        <div><Label className="text-xs">Stock</Label><Input className="rounded-sm mt-1" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
      </div>
      <div><Label className="text-xs">Category</Label><Input className="rounded-sm mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
    </div>
  );

  const inStockCount = products.filter((p) => p.inStock).length;
  const totalValue = products.reduce((s, p) => s + p.unitPrice * p.stock, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product listings and stock levels</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-sm" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-1" /> Create Product
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-sm">
            <DialogHeader><DialogTitle>Create New Product</DialogTitle></DialogHeader>
            {formFields}
            <DialogFooter><Button className="rounded-sm" onClick={handleCreate}>Create Product</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Products</p>
          <p className="text-2xl font-semibold mt-1">{products.length}</p>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">In Stock</p>
          <p className="text-2xl font-semibold mt-1 text-success">{inStockCount}</p>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Inventory Value</p>
          <p className="text-2xl font-semibold mt-1">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-card border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider font-semibold">SKU</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Product Name</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Unit Price</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Lot Price</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Stock</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-center">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="text-sm">
                <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[240px]">{p.description}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="rounded-sm text-xs font-normal">{p.category}</Badge></TableCell>
                <TableCell className="text-right font-mono">${p.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">${p.lotPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{p.stock.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Switch checked={p.inStock} onCheckedChange={() => toggleStock(p.id)} className="data-[state=checked]:bg-success" />
                    <span className={`text-xs ${p.inStock ? "text-success" : "text-destructive"}`}>
                      {p.inStock ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog open={editProduct?.id === p.id} onOpenChange={(open) => { if (!open) setEditProduct(null); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-sm h-8 w-8 p-0" onClick={() => openEdit(p)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-sm">
                      <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
                      {formFields}
                      <DialogFooter><Button className="rounded-sm" onClick={handleEdit}>Save Changes</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
