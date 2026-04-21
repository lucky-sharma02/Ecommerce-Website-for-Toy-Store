import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const users = [
  { id: "U001", name: "FunZone Retail Co.", email: "orders@funzone.com", role: "Retailer", status: "Active", joined: "2024-03-15" },
  { id: "U002", name: "KidsMart Inc.", email: "procurement@kidsmart.com", role: "Retailer", status: "Active", joined: "2024-05-22" },
  { id: "U003", name: "ToyMax Distribution", email: "admin@toymax.com", role: "Wholesaler", status: "Active", joined: "2024-01-10" },
  { id: "U004", name: "BrickWorld Supply", email: "sales@brickworld.com", role: "Wholesaler", status: "Suspended", joined: "2024-06-01" },
  { id: "U005", name: "PlayWorld Stores", email: "buy@playworld.com", role: "Retailer", status: "Active", joined: "2024-07-18" },
  { id: "U006", name: "EduPlay Corp", email: "wholesale@eduplay.com", role: "Wholesaler", status: "Active", joined: "2024-02-28" },
  { id: "U007", name: "ToyBox Express", email: "info@toybox.com", role: "Retailer", status: "Active", joined: "2024-09-05" },
];

const roleStyles: Record<string, string> = {
  Retailer: "bg-primary/10 text-primary border-primary/20",
  Wholesaler: "bg-warning/10 text-warning border-warning/20",
};

export default function AdminUsers() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">User Directory</h1>
      <div className="bg-card border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider font-semibold">ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Company</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Email</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-center">Role</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-center">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="text-sm">
                <TableCell className="font-mono text-xs">{u.id}</TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`rounded-sm text-[10px] ${roleStyles[u.role]}`}>{u.role}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`rounded-sm text-[10px] ${u.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>{u.status}</Badge>
                </TableCell>
                <TableCell>{u.joined}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
