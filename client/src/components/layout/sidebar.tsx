import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  HardHat,
  LayoutDashboard,
  Package,
  Store,
  Boxes,
  Tags,
  Receipt,
  BarChart3,
  Warehouse,
  LogOut,
  TrendingUp,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["owner_admin", "vendor_manager", "vendor"],
  },
  // Customer/User Role Navigation
  {
    name: "Shop",
    href: "/shop-ecommerce", 
    icon: Store,
    roles: ["user", "customer"],
  },
  // Admin Role Navigation
  {
    name: "Admin Panel",
    href: "/admin",
    icon: HardHat,
    roles: ["owner_admin"],
  },
  {
    name: "All Products",
    href: "/products",
    icon: Boxes,
    roles: ["owner_admin", "vendor_manager"],
    badge: "1,247",
  },
  {
    name: "Vendor Management", 
    href: "/vendors",
    icon: Store,
    roles: ["owner_admin"],
    badge: "43",
  },
  // Vendor Role Navigation
  {
    name: "Vendor Panel",
    href: "/vendor-panel",
    icon: Store,
    roles: ["vendor"],
  },
  {
    name: "My Products",
    href: "/my-products",
    icon: Package,
    roles: ["vendor"],
    badge: "87",
  },
  // Common Navigation
  {
    name: "Categories",
    href: "/categories",
    icon: Tags,
    roles: ["owner_admin", "vendor_manager", "vendor"],
  },
  {
    name: "Orders",
    href: "/orders",
    icon: Receipt,
    roles: ["owner_admin", "vendor_manager", "vendor", "user", "customer"],
    badge: "12",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["owner_admin", "vendor_manager", "vendor"],
  },
  {
    name: "Advanced Analytics",
    href: "/advanced-analytics",
    icon: BarChart3,
    roles: ["owner_admin", "vendor_manager", "vendor", "user", "customer"],
    badge: "17 Tools",
    badgeVariant: "default" as const,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Warehouse,
    roles: ["owner_admin", "vendor_manager", "vendor"],
    badge: "5",
    badgeVariant: "destructive" as const,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside className="w-64 bg-surface shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <HardHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">BuildMart AI</h1>
            <p className="text-sm text-gray-500">Construction Trading</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {getUserInitials(user.username)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.username}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role.replace("_", " ")}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
            Online
          </Badge>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || "secondary"}
                    className="ml-auto"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
