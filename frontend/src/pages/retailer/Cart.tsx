import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ShoppingCart } from "lucide-react";
import type { CartItem } from "./Catalog";

export default function RetailerCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const removeItem = (id: string) => {
    updateCart(cart.filter((c) => c.product.id !== id));
  };

  const getItemTotal = (item: CartItem) => {
    const { product, quantity } = item;
    const lots = Math.floor(quantity / product.lotSize);
    const remaining = quantity % product.lotSize;
    return lots * product.lotPrice + remaining * product.unitPrice;
  };

  const grandTotal = cart.reduce((s, item) => s + getItemTotal(item), 0);

  if (cart.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Shopping Cart</h1>
      <div className="bg-card border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Product</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Qty</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Unit Price</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Subtotal</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.map((item) => (
              <TableRow key={item.product.id} className="text-sm">
                <TableCell className="font-medium">{item.product.name}</TableCell>
                <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                <TableCell className="text-right font-mono">${item.product.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono font-semibold">${getItemTotal(item).toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm text-destructive" onClick={() => removeItem(item.product.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4 p-4 bg-card border rounded-sm">
        <p className="text-sm text-muted-foreground">Lot pricing applied automatically when quantity meets lot threshold.</p>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">Grand Total</p>
            <p className="text-2xl font-bold">${grandTotal.toFixed(2)}</p>
          </div>
          <Button className="rounded-sm" onClick={() => navigate("/retailer/checkout")}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
