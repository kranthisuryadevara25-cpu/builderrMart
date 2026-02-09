import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";
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
      <Route path="/" component={CustomerEcommerce} />
      <Route path="/product/:id" component={CustomerEcommerce} />
      <Route path="/category/:categoryId" component={CustomerEcommerce} />
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
      
      <Route path="/shop">
        <ProtectedRoute>
          <Shop />
        </ProtectedRoute>
      </Route>
      
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

function FirebaseSetupMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">BuildMart AI – Firebase setup</h1>
        <p className="text-muted-foreground">
          Configure Firebase to use this app. Create a project at{" "}
          <a href="https://console.firebase.google.com" className="text-primary underline" target="_blank" rel="noreferrer">Firebase Console</a>, then add to <code className="bg-muted px-1 rounded">.env</code>:
        </p>
        <pre className="text-left bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
        </pre>
        <p className="text-sm text-muted-foreground">See .env.example in the project root.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!isFirebaseConfigured ? (
          <FirebaseSetupMessage />
        ) : (
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
