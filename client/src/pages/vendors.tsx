import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type User, type Product } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, Edit, Trash2, Plus, Store, Users, Package } from "lucide-react";

export default function Vendors() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>();
  const [showVendorDetails, setShowVendorDetails] = useState(false);

  // Mock vendor data (in a real app, you'd have an API endpoint for users/vendors)
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Group products by vendor to create vendor statistics
  const vendorStats = React.useMemo(() => {
    if (!products) return [];
    
    const vendors = new Map();
    
    products.forEach(product => {
      if (!vendors.has(product.vendorId)) {
        vendors.set(product.vendorId, {
          id: product.vendorId,
          // In a real app, you'd fetch user details from an API
          name: `Vendor ${product.vendorId.slice(-4)}`,
          email: `vendor${product.vendorId.slice(-4)}@buildmart.com`,
          role: 'vendor',
          isActive: true,
          productsCount: 0,
          totalValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }
      
      const vendor = vendors.get(product.vendorId);
      vendor.productsCount++;
      vendor.totalValue += parseFloat(product.basePrice) * (product.stockQuantity || 0);
      
      if (product.stockQuantity === 0) vendor.outOfStockItems++;
      else if (product.stockQuantity && product.stockQuantity < 50) vendor.lowStockItems++;
    });
    
    return Array.from(vendors.values());
  }, [products]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">You don't have permission to access vendor management.</p>
        </div>
      </div>
    );
  }

  const filteredVendors = vendorStats.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVendors = vendorStats.length;
  const activeVendors = vendorStats.filter(v => v.isActive).length;
  const totalProducts = vendorStats.reduce((sum, vendor) => sum + vendor.productsCount, 0);
  const totalValue = vendorStats.reduce((sum, vendor) => sum + vendor.totalValue, 0);

  const handleViewVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowVendorDetails(true);
  };

  const handleEditVendor = (vendor: any) => {
    toast({
      title: "Edit Vendor",
      description: `Opening edit form for ${vendor.name}`,
    });
    // Add edit functionality here
  };

  const handleDeleteVendor = (vendorId: string) => {
    toast({
      title: "Delete Vendor",
      description: "Vendor deletion functionality to be implemented",
      variant: "destructive",
    });
    // Add delete functionality here
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Vendor Management"
          subtitle="Manage vendors and their performance"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalVendors}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                      <p className="text-2xl font-semibold text-green-600">{activeVendors}</p>
                    </div>
                    <Store className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Products</p>
                      <p className="text-2xl font-semibold text-purple-600">{totalProducts}</p>
                    </div>
                    <Package className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Value</p>
                      <p className="text-2xl font-semibold text-orange-600">₹{totalValue.toLocaleString()}</p>
                    </div>
                    <Package className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vendor Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vendor Directory</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Stock Issues</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No vendors found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVendors.map((vendor) => (
                          <TableRow key={vendor.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{vendor.name}</p>
                                <p className="text-sm text-gray-500">{vendor.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{vendor.productsCount}</span>
                            </TableCell>
                            <TableCell>₹{vendor.totalValue.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {vendor.lowStockItems > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {vendor.lowStockItems} Low
                                  </Badge>
                                )}
                                {vendor.outOfStockItems > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {vendor.outOfStockItems} Out
                                  </Badge>
                                )}
                                {vendor.lowStockItems === 0 && vendor.outOfStockItems === 0 && (
                                  <Badge variant="default" className="text-xs">Good</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={vendor.isActive ? "default" : "secondary"}>
                                {vendor.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{vendor.joinedDate}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewVendor(vendor)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditVendor(vendor)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteVendor(vendor.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <Dialog open={showVendorDetails} onOpenChange={setShowVendorDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vendor Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedVendor.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-gray-500">Name:</span> {selectedVendor.name}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedVendor.email}</p>
                    <p><span className="text-gray-500">Status:</span> 
                      <Badge variant={selectedVendor.isActive ? "default" : "secondary"} className="ml-2">
                        {selectedVendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                    <p><span className="text-gray-500">Joined:</span> {selectedVendor.joinedDate}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-gray-500">Products:</span> {selectedVendor.productsCount}</p>
                    <p><span className="text-gray-500">Total Value:</span> ₹{selectedVendor.totalValue.toLocaleString()}</p>
                    <p><span className="text-gray-500">Low Stock:</span> {selectedVendor.lowStockItems}</p>
                    <p><span className="text-gray-500">Out of Stock:</span> {selectedVendor.outOfStockItems}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button>Send Message</Button>
                <Button variant="outline">View Products</Button>
                <Button variant="outline">Export Data</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}