import { useState, useEffect } from "react";
import { DollarSign, Package, FileText, TrendingUp } from "lucide-react";

export default function WholesalerDashboard() {
  const [totalSales, setTotalSales] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [avgOrder, setAvgOrder] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/products/")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setActiveProducts(data.filter((p: any) => p.stock > 0).length);
      })
      .catch(console.error);

    fetch("http://127.0.0.1:8000/api/v1/orders/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const sales = data.reduce((s: number, o: any) => s + (o.total_amount || 0), 0);
        setTotalSales(sales);
        setPendingInvoices(data.filter((o: any) => o.status === "pending").length);
        setAvgOrder(data.length > 0 ? sales / data.length : 0);
      })
      .catch(console.error);
  }, []);

  const metrics = [
    { label: "Total Sales", value: `$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-success" },
    { label: "Active Products", value: activeProducts, icon: Package, color: "text-primary" },
    { label: "Pending Orders", value: pendingInvoices, icon: FileText, color: "text-warning" },
    { label: "Avg. Order Value", value: `$${avgOrder.toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Wholesaler Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{m.label}</p>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <p className="text-2xl font-semibold">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
