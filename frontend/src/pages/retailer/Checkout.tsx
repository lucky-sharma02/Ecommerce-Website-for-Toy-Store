import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, MapPin, ShoppingCart } from "lucide-react";
import type { CartItem } from "./Catalog";

export default function RetailerCheckout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    if (items.length === 0) {
      navigate("/retailer/cart");
      return;
    }
    setCart(items);
  }, [navigate]);

  const getItemTotal = (item: CartItem) => {
    const { product, quantity } = item;
    const lots = Math.floor(quantity / product.lotSize);
    const remaining = quantity % product.lotSize;
    return lots * product.lotPrice + remaining * product.unitPrice;
  };

  const grandTotal = cart.reduce((s, item) => s + getItemTotal(item), 0);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.email || !form.address || !form.city || !form.zip) {
      return;
    }
    localStorage.setItem("checkoutDetails", JSON.stringify(form));
    navigate("/retailer/payment");
  };

  if (cart.length === 0) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button variant="ghost" className="rounded-sm mb-4 text-sm" onClick={() => navigate("/retailer/cart")}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Button>
      <h1 className="text-xl font-semibold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleProceed} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Company Name *</Label>
                    <Input className="rounded-sm" required value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Contact Person *</Label>
                    <Input className="rounded-sm" required value={form.contactName} onChange={(e) => handleChange("contactName", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Email *</Label>
                    <Input type="email" className="rounded-sm" required value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Phone</Label>
                    <Input type="tel" className="rounded-sm" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Shipping Address *</Label>
                  <Input className="rounded-sm" required value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider">City *</Label>
                    <Input className="rounded-sm" required value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider">State</Label>
                    <Input className="rounded-sm" value={form.state} onChange={(e) => handleChange("state", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider">ZIP Code *</Label>
                    <Input className="rounded-sm" required value={form.zip} onChange={(e) => handleChange("zip", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Order Notes</Label>
                  <Input className="rounded-sm" placeholder="Special instructions..." value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-sm sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate pr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-mono font-medium shrink-0">${getItemTotal(item).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-semibold">${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono text-success font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold font-mono">${grandTotal.toFixed(2)}</span>
              </div>
              <Button type="submit" form="checkout-form" className="w-full rounded-sm mt-2">
                Proceed to Payment
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
