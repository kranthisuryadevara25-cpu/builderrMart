import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type Product, type Category } from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Eye, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  TruckIcon,
  DollarSign,
  ShoppingCart
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: string;
  vendorId: string;
}

export default function Orders() {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Mock orders data (in a real app, this would come from an API)
  const mockOrders: Order[] = [
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      customerName: "ABC Construction Co.",
      customerEmail: "orders@abcconstruction.com",
      products: [
        { id: "1", name: "Premium Portland Cement", quantity: 50, price: 450 },
        { id: "2", name: "Steel Rebar 10mm", quantity: 100, price: 65 }
      ],
      totalAmount: 29000,
      status: 'confirmed',
      orderDate: "2024-01-15",
      deliveryDate: "2024-01-20",
      shippingAddress: "123 Construction Site, Mumbai, Maharashtra",
      vendorId: user?.role === "vendor" ? user.id : "vendor1"
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      customerName: "XYZ Builders",
      customerEmail: "procurement@xyzbuilders.com",
      products: [
        { id: "3", name: "Concrete Blocks", quantity: 200, price: 25 }
      ],
      totalAmount: 5000,
      status: 'shipped',
      orderDate: "2024-01-14",
      deliveryDate: "2024-01-18",
      shippingAddress: "456 Project Site, Delhi, NCR",
      vendorId: user?.role === "vendor" ? user.id : "vendor2"
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      customerName: "MNO Infrastructure",
      customerEmail: "orders@mnoinfra.com",
      products: [
        { id: "4", name: "PVC Pipes 4 inch", quantity: 30, price: 120 },
        { id: "5", name: "Electrical Cables", quantity: 5, price: 850 }
      ],
      totalAmount: 7850,
      status: 'pending',
      orderDate: "2024-01-16",
      shippingAddress: "789 Site Location, Bangalore, Karnataka",
      vendorId: user?.role === "vendor" ? user.id : "vendor1"
    },
    {
      id: "4",
      orderNumber: "ORD-2024-004",
      customerName: "PQR Constructions",
      customerEmail: "purchase@pqrconstructions.com",
      products: [
        { id: "6", name: "Ceramic Tiles", quantity: 100, price: 45 }
      ],
      totalAmount: 4500,
      status: 'delivered',
      orderDate: "2024-01-12",
      deliveryDate: "2024-01-16",
      shippingAddress: "321 Building Site, Chennai, Tamil Nadu",
      vendorId: user?.role === "vendor" ? user.id : "vendor3"
    }
  ];

  // Filter orders based on user role
  const orders = user?.role === "vendor" 
    ? mockOrders.filter(order => order.vendorId === user.id)
    : mockOrders;

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'shipped': return TruckIcon;
      case 'delivered': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm && statusFilter === "all") return true;
    
    let matchesSearch = true;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      matchesSearch = order.orderNumber.toLowerCase().includes(search) ||
                     order.customerName.toLowerCase().includes(search) ||
                     order.customerEmail.toLowerCase().includes(search) ||
                     order.shippingAddress.toLowerCase().includes(search) ||
                     order.totalAmount.toString().includes(search) ||
                     order.status.toLowerCase().includes(search) ||
                     order.orderDate.includes(search) ||
                     order.deliveryDate?.includes(search) ||
                     order.products.some(product => 
                       product.name.toLowerCase().includes(search) ||
                       product.price.toString().includes(search) ||
                       product.quantity.toString().includes(search)
                     );
    }
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title={isAdmin ? "Order Management" : "My Orders"}
          subtitle="Track and manage customer orders"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                      <p className="text-2xl font-semibold text-orange-600">{pendingOrders}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Confirmed Orders</p>
                      <p className="text-2xl font-semibold text-green-600">{confirmedOrders}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-semibold text-purple-600">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search orders by number, customer, email, address, products, or amount..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-orders"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No orders found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => {
                          const StatusIcon = getStatusIcon(order.status);
                          
                          return (
                            <TableRow key={order.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{order.orderNumber}</p>
                                  {order.deliveryDate && (
                                    <p className="text-sm text-gray-500">Due: {order.deliveryDate}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{order.customerName}</p>
                                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{order.products.length} items</span>
                              </TableCell>
                              <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1 w-fit">
                                  <StatusIcon className="h-3 w-3" />
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.orderDate}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                Complete information about this order
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedOrder.customerEmail}</p>
                    <p><span className="text-gray-500">Shipping Address:</span></p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Order Date:</span> {selectedOrder.orderDate}</p>
                    {selectedOrder.deliveryDate && (
                      <p><span className="text-gray-500">Delivery Date:</span> {selectedOrder.deliveryDate}</p>
                    )}
                    <p><span className="text-gray-500">Status:</span> 
                      <Badge variant={getStatusColor(selectedOrder.status)} className="ml-2">
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </p>
                    <p><span className="text-gray-500">Total Amount:</span> <span className="font-semibold">₹{selectedOrder.totalAmount.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ordered Items</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>₹{(product.quantity * product.price).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button>Update Status</Button>
                <Button variant="outline">Print Invoice</Button>
                <Button variant="outline">Send Email</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}