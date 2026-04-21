import { Package, ShoppingCart, ClipboardList, BarChart3, LayoutDashboard, Users, FileText, Shield, Store, ChevronDown, CreditCard, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const retailerItems = [
  { title: "Product Catalog", url: "/retailer/catalog", icon: Store },
  { title: "Shopping Cart", url: "/retailer/cart", icon: ShoppingCart },
  { title: "Checkout", url: "/retailer/checkout", icon: CreditCard },
  { title: "Order History", url: "/retailer/orders", icon: ClipboardList },
];

const wholesalerItems = [
  { title: "Dashboard", url: "/wholesaler/dashboard", icon: LayoutDashboard },
  { title: "Inventory", url: "/wholesaler/inventory", icon: Package },
  { title: "Invoices", url: "/wholesaler/invoices", icon: FileText },
];

const adminItems = [
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Moderation", url: "/admin/moderation", icon: Shield },
  { title: "User Directory", url: "/admin/users", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/auth/login");
  };

  const renderGroup = (label: string, items: typeof retailerItems) => (
    <SidebarGroup key={label}>
      <SidebarGroupLabel className="text-sidebar-foreground/60 text-[11px] uppercase tracking-wider font-semibold">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-4">
        <div className="px-4 pb-4 mb-2 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-sidebar-primary" />
              <div>
                <h1 className="text-sm font-bold text-sidebar-foreground">ToyTrade</h1>
                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Wholesale Platform</p>
              </div>
            </div>
          )}
          {collapsed && <Package className="h-6 w-6 text-sidebar-primary mx-auto" />}
        </div>
        {userRole === "retailer" && renderGroup("Retailer", retailerItems)}
        {userRole === "wholesaler" && renderGroup("Wholesaler", wholesalerItems)}
        {userRole === "admin" && renderGroup("Admin", adminItems)}
        <div className="mt-auto px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
