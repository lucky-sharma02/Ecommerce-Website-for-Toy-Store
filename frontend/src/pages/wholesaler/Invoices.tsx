import { useState, useEffect } from "react";
import { Invoice } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  Paid: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function WholesalerInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/orders/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((o: any) => ({
          id: `INV-${o.id}`,
          retailer: `Customer #${o.user_id}`,
          amount: o.total_amount,
          dueDate: o.created_at ? o.created_at.split('T')[0] : 'N/A',
          status: o.payment_status === "paid" ? "Paid" : o.status === "pending" ? "Pending" : "Overdue"
        }));
        setInvoices(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  const downloadInvoice = (invoiceId: string, retailer: string, amount: number) => {
  const content = `
INVOICE
========================================
Invoice ID:  ${invoiceId}
Retailer:    ${retailer}
Amount:      $${amount.toFixed(2)}
Platform:    ToyTrade Wholesale
========================================
This is a mock invoice for demo purposes.
  `.trim();

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceId}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${invoiceId}`);
};

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Invoice Management</h1>
      <div className="bg-card border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Invoice ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Retailer</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Amount</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Due Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-center">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="text-sm">
                <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                <TableCell className="font-medium">{inv.retailer}</TableCell>
                <TableCell className="text-right font-mono font-semibold">${inv.amount.toFixed(2)}</TableCell>
                <TableCell>{inv.dueDate}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`rounded-sm text-[10px] ${statusStyles[inv.status]}`}>{inv.status}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm h-7 text-xs"
                    onClick={() => downloadInvoice(inv.id, inv.retailer, inv.amount)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
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
