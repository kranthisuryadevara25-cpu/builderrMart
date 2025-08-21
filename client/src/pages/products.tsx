import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ProductTable } from "@/components/products/product-table";

export default function Products() {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title={isAdmin ? "Product Management" : "My Products"}
          subtitle={isAdmin ? "Manage construction materials and inventory" : "Manage your product listings"}
        />
        
        <div className="flex-1 overflow-auto p-6">
          <ProductTable vendorId={user.role === "vendor" ? user.id : undefined} />
        </div>
      </main>
    </div>
  );
}
