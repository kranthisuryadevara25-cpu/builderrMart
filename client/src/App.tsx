import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Inventory from "@/pages/inventory";
import Analytics from "@/pages/analytics";
import Vendors from "@/pages/vendors";
import Orders from "@/pages/orders";
import Shop from "@/pages/shop";
import AdminPanel from "@/pages/admin-panel";
import ComprehensiveAdminPanel from "@/pages/comprehensive-admin";
import VendorPanel from "@/pages/vendor-panel";
import CustomerApp from "@/pages/customer-app";
import CustomerEcommerce from "@/pages/customer-ecommerce";
import AdminDashboard from "@/pages/admin";
import UserProfile from "@/pages/user-profile";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import { lazy } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Public e-commerce site - no login required */}
      <Route path="/" component={Shop} />
      <Route path="/product/:id" component={Shop} />
      <Route path="/category/:categoryId" component={Shop} />
      <Route path="/profile" component={UserProfile} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/products">
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      </Route>
      
      <Route path="/my-products">
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      </Route>
      
      <Route path="/categories">
        <ProtectedRoute>
          <Categories />
        </ProtectedRoute>
      </Route>
      
      <Route path="/inventory">
        <ProtectedRoute>
          <Inventory />
        </ProtectedRoute>
      </Route>
      
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
      
      <Route path="/advanced-analytics">
        <ProtectedRoute>
          <AnalyticsDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendors">
        <ProtectedRoute>
          <Vendors />
        </ProtectedRoute>
      </Route>
      
      <Route path="/orders">
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      </Route>
      
      <Route path="/shop" component={Shop} />
      
      <Route path="/customer">
        <ProtectedRoute>
          <CustomerApp />
        </ProtectedRoute>
      </Route>
      
      {/* Admin routes - protected */}
      <Route path="/admin-dashboard">
        {user ? (
          user.role === "user" ? <Redirect to="/" /> : <Redirect to="/dashboard" />
        ) : <Redirect to="/login" />}
      </Route>
      
      {/* Admin panel - accessible without authentication for development */}
      <Route path="/admin" component={AdminPanel} />
      
      <Route path="/admin-dashboard">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor-panel">
        <ProtectedRoute>
          <VendorPanel />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor-dashboard">
        <ProtectedRoute>
          <VendorDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager-dashboard">
        <ProtectedRoute>
          <ManagerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/voice-demo">
        <ProtectedRoute>
          <div>Voice Demo Coming Soon</div>
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
