import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Gift, 
  History, 
  RefreshCw, 
  Edit, 
  Save,
  TrendingUp,
  Package,
  Calendar
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loyaltyPoints?: number;
  totalOrders?: number;
  totalSpent?: number;
  memberSince?: string;
  lastOrderDate?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: any;
}

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    retry: false,
  });

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/user/orders"],
    retry: false,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/orders/${orderId}/reorder`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      setShowReorderDialog(false);
      toast({
        title: "Order Created",
        description: "Your repeat order has been successfully created!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reorder Failed",
        description: error.message || "Failed to create repeat order",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate(editedProfile);
  };

  const handleReorder = (order: Order) => {
    setSelectedOrder(order);
    setShowReorderDialog(true);
  };

  const confirmReorder = () => {
    if (selectedOrder) {
      reorderMutation.mutate(selectedOrder.id);
    }
  };

  const calculateLoyaltyLevel = (points: number) => {
    if (points >= 10000) return { level: "Platinum", color: "bg-purple-500" };
    if (points >= 5000) return { level: "Gold", color: "bg-yellow-500" };
    if (points >= 2000) return { level: "Silver", color: "bg-gray-400" };
    return { level: "Bronze", color: "bg-orange-500" };
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const loyaltyLevel = calculateLoyaltyLevel(profile?.loyaltyPoints || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{profile?.username || 'User'}</h1>
                  <p className="text-gray-600">{profile?.email}</p>
                  <div className="flex items-center mt-2">
                    <Badge className={`${loyaltyLevel.color} text-white mr-2`}>
                      {loyaltyLevel.level} Member
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {profile?.loyaltyPoints || 0} Points
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                disabled={updateProfile.isPending}
              >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Points</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={editedProfile.username || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={editedProfile.email || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      type="email"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={editedProfile.address || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={editedProfile.city || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={editedProfile.state || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, state: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>PIN Code</Label>
                    <Input
                      value={editedProfile.pincode || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, pincode: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="PIN Code"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <p className="text-2xl font-bold">{profile?.totalOrders || 0}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Spent</p>
                      <p className="text-2xl font-bold">₹{(profile?.totalSpent || 0).toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-2xl font-bold">
                        {profile?.memberSince ? new Date(profile.memberSince).getFullYear() : new Date().getFullYear()}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order: Order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {Array.isArray(order.items) ? order.items.length : 0} items
                        </TableCell>
                        <TableCell>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'outline'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorder(order)}
                            className="flex items-center"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Reorder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Loyalty Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold text-blue-600">
                      {profile?.loyaltyPoints || 0}
                    </div>
                    <p className="text-gray-600">Available Points</p>
                    <Badge className={`${loyaltyLevel.color} text-white text-lg px-4 py-2`}>
                      {loyaltyLevel.level} Status
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rewards Program</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Bronze (0-1,999 points)</span>
                      <Badge variant={loyaltyLevel.level === 'Bronze' ? 'default' : 'outline'}>
                        {loyaltyLevel.level === 'Bronze' ? 'Current' : '1% cashback'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Silver (2,000-4,999 points)</span>
                      <Badge variant={loyaltyLevel.level === 'Silver' ? 'default' : 'outline'}>
                        {loyaltyLevel.level === 'Silver' ? 'Current' : '2% cashback'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Gold (5,000-9,999 points)</span>
                      <Badge variant={loyaltyLevel.level === 'Gold' ? 'default' : 'outline'}>
                        {loyaltyLevel.level === 'Gold' ? 'Current' : '3% cashback'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Platinum (10,000+ points)</span>
                      <Badge variant={loyaltyLevel.level === 'Platinum' ? 'default' : 'outline'}>
                        {loyaltyLevel.level === 'Platinum' ? 'Current' : '5% cashback'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-medium">
                        ₹{profile?.totalOrders > 0 ? Math.round((profile?.totalSpent || 0) / profile.totalOrders).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Order</span>
                      <span className="font-medium">
                        {profile?.lastOrderDate ? new Date(profile.lastOrderDate).toLocaleDateString() : 'No orders yet'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders This Year</span>
                      <span className="font-medium">
                        {orders?.filter((order: Order) => new Date(order.createdAt).getFullYear() === new Date().getFullYear()).length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Account Age</span>
                      <span className="font-medium">
                        {profile?.memberSince ? 
                          Math.floor((Date.now() - new Date(profile.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 365)) + ' years' : 
                          '0 years'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loyalty Status</span>
                      <Badge className={loyaltyLevel.color + ' text-white'}>
                        {loyaltyLevel.level}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Milestone</span>
                      <span className="font-medium">
                        {loyaltyLevel.level === 'Bronze' ? '2,000 points for Silver' :
                         loyaltyLevel.level === 'Silver' ? '5,000 points for Gold' :
                         loyaltyLevel.level === 'Gold' ? '10,000 points for Platinum' :
                         'Maximum level reached!'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reorder Confirmation Dialog */}
        <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Repeat Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to reorder the following order?</p>
              {selectedOrder && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Order:</strong> #{selectedOrder.orderNumber}</p>
                  <p><strong>Original Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ₹{parseFloat(selectedOrder.totalAmount).toLocaleString()}</p>
                  <p><strong>Items:</strong> {Array.isArray(selectedOrder.items) ? selectedOrder.items.length : 0} items</p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReorderDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmReorder} disabled={reorderMutation.isPending}>
                  {reorderMutation.isPending ? 'Creating Order...' : 'Confirm Reorder'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}