import { useState, useEffect } from "react";
import { Order } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  paid: "bg-success/10 text-success border-success/20",
  processing: "bg-primary/10 text-primary border-primary/20",
};

export default function RetailerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/orders/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((o: any) => ({
          id: `ORD-${o.id}`,
          date: o.created_at ? o.created_at.split('T')[0] : 'N/A',
          items: o.items ? o.items.map((i: any) => ({
             productName: i.product_name,
             qty: i.quantity,
             price: i.price
          })) : [],
          total: o.total_amount,
          status: o.status
        }));
        setOrders(mapped);
      })
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Order History</h1>
      <div className="bg-card border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Order ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Items</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Total</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-center">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} className="text-sm">
                <TableCell className="font-mono text-xs">{o.id}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell>
                  {o.items.map((i) => (
                    <span key={i.productName} className="block text-xs">{i.qty}x {i.productName}</span>
                  ))}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">${o.total.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`rounded-sm text-[10px] ${statusStyles[o.status]}`}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="rounded-sm h-8 text-xs" onClick={() => toast.info("PDF download started")}>
                    <FileDown className="h-3.5 w-3.5 mr-1" /> PDF
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
