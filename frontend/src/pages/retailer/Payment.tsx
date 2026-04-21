import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, CreditCard, Landmark, Smartphone, Truck } from "lucide-react";
import { toast } from "sonner";
import type { CartItem } from "./Catalog";

type PaymentMethod = "upi" | "netbanking" | "cod";

const paymentOptions = [
  { value: "upi" as const, label: "UPI Payment", description: "Pay using any UPI app (GPay, PhonePe, Paytm)", icon: Smartphone },
  { value: "netbanking" as const, label: "Net Banking", description: "Pay via your bank's internet banking portal", icon: Landmark },
  { value: "cod" as const, label: "Cash on Delivery", description: "Pay when you receive the goods", icon: Truck },
];

export default function RetailerPayment() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    if (items.length === 0) {
      navigate("/retailer/cart");
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

  const handlePay = async () => {
    if (method === "upi" && !upiId) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (method === "netbanking" && !bank) {
      toast.error("Please select your bank");
      return;
    }

    try {
      const checkoutDetails = JSON.parse(localStorage.getItem("checkoutDetails") || "{}");
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in to place an order");
        return;
      }

      const orderPayload = {
        total_amount: grandTotal + (method === "cod" ? 5 : 0),
        tax_amount: 0.0,
        shipping_address: `${checkoutDetails.address}, ${checkoutDetails.city}, ${checkoutDetails.state} ${checkoutDetails.zip}`,
        items: cart.map(c => ({
          product_name: c.product.name,
          quantity: c.quantity,
          price: c.product.unitPrice
        }))
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        throw new Error("Failed to place order securely.");
      }

      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutDetails");
      setOrderPlaced(true);
      toast.success("Order placed successfully via API!");
    } catch(err: any) {
      toast.error(err.message || "Failed to contact database / backend.");
    }
  };

  if (orderPlaced) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 rounded-sm bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Order Placed Successfully!</h1>
        <p className="text-sm text-muted-foreground mb-1">
          Payment method: <span className="font-medium text-foreground">{paymentOptions.find((p) => p.value === method)?.label}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-6">Your order will be processed shortly.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-sm" onClick={() => navigate("/retailer/orders")}>
            View Orders
          </Button>
          <Button className="rounded-sm" onClick={() => navigate("/retailer/catalog")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button variant="ghost" className="rounded-sm mb-4 text-sm" onClick={() => navigate("/retailer/checkout")}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Checkout
      </Button>
      <h1 className="text-xl font-semibold mb-6">Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="rounded-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Select Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="space-y-3">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
                      method === opt.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} className="mt-0.5" />
                    <opt.icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {method === "upi" && (
                <div className="mt-4 space-y-2 p-3 bg-muted/50 rounded-sm">
                  <Label className="text-xs font-semibold uppercase tracking-wider">UPI ID</Label>
                  <Input className="rounded-sm" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                </div>
              )}

              {method === "netbanking" && (
                <div className="mt-4 space-y-2 p-3 bg-muted/50 rounded-sm">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Select Bank</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Bank of Baroda"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBank(b)}
                        className={`text-left text-xs p-2 border rounded-sm transition-colors ${
                          bank === b ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted/50"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {method === "cod" && (
                <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-sm">
                  <p className="text-xs text-warning font-medium">Note: Cash on Delivery orders may take 1-2 additional business days for processing.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-sm sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({cart.length})</span>
                <span className="font-mono font-medium">${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono text-success font-medium">Free</span>
              </div>
              {method === "cod" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">COD Fee</span>
                  <span className="font-mono font-medium">$5.00</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold font-mono">
                  ${(grandTotal + (method === "cod" ? 5 : 0)).toFixed(2)}
                </span>
              </div>
              <Button className="w-full rounded-sm mt-2" onClick={handlePay}>
                {method === "cod" ? "Place Order" : "Pay Now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
