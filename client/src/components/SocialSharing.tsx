import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Users, 
  MessageCircle, 
  ThumbsUp, 
  Copy, 
  Send,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  Building2,
  User,
  Star,
  Calendar,
  MapPin,
  Award,
  CheckCircle,
  Plus,
  Search
} from "lucide-react";
import type { Product } from "@shared/schema";

interface Contractor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  completedProjects: number;
  verified: boolean;
  profileImage?: string;
  contactNumber: string;
  email: string;
  experience: number;
  services: string[];
}

interface SocialSharingProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  shareType: 'product' | 'project' | 'contractor_network';
}

export default function SocialSharing({ 
  isOpen, 
  onOpenChange, 
  product, 
  shareType 
}: SocialSharingProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'share' | 'network' | 'community'>('share');
  const [shareMessage, setShareMessage] = useState("");
  const [searchContractors, setSearchContractors] = useState("");
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);

  // Mock contractor data
  const contractors: Contractor[] = [
    {
      id: '1',
      name: 'Rajesh Construction Co.',
      specialization: 'Residential Buildings',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      completedProjects: 125,
      verified: true,
      contactNumber: '+91 98765 43210',
      email: 'info@rajeshconstruction.com',
      experience: 12,
      services: ['Foundation Work', 'Structural Construction', 'Interior Work']
    },
    {
      id: '2',
      name: 'Modern Builders Pvt Ltd',
      specialization: 'Commercial Projects',
      location: 'Pune, Maharashtra',
      rating: 4.6,
      completedProjects: 89,
      verified: true,
      contactNumber: '+91 98765 43211',
      email: 'contact@modernbuilders.com',
      experience: 15,
      services: ['Commercial Construction', 'Industrial Projects', 'Infrastructure']
    },
    {
      id: '3',
      name: 'Green Construction',
      specialization: 'Eco-Friendly Building',
      location: 'Bangalore, Karnataka',
      rating: 4.9,
      completedProjects: 67,
      verified: true,
      contactNumber: '+91 98765 43212',
      email: 'hello@greenconstruction.in',
      experience: 8,
      services: ['Green Building', 'Solar Installation', 'Water Harvesting']
    },
    {
      id: '4',
      name: 'City Contractors',
      specialization: 'Renovation & Repair',
      location: 'Delhi, NCR',
      rating: 4.7,
      completedProjects: 156,
      verified: false,
      contactNumber: '+91 98765 43213',
      email: 'info@citycontractors.com',
      experience: 10,
      services: ['Home Renovation', 'Repair Work', 'Maintenance']
    }
  ];

  const filteredContractors = contractors.filter(contractor =>
    contractor.name.toLowerCase().includes(searchContractors.toLowerCase()) ||
    contractor.specialization.toLowerCase().includes(searchContractors.toLowerCase()) ||
    contractor.location.toLowerCase().includes(searchContractors.toLowerCase())
  );

  const shareToSocialMedia = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = shareMessage || (product ? 
      `Check out this ${product.name} from BuildMart AI! Great quality construction material at ₹${product.basePrice}` :
      "Check out BuildMart AI - your one-stop shop for construction materials!"
    );

    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }

    toast({
      title: "Shared Successfully!",
      description: `Content shared to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    });
  };

  const copyToClipboard = async () => {
    const shareUrl = window.location.href;
    const shareText = shareMessage || (product ? 
      `${product.name} - ₹${product.basePrice}\n${shareUrl}` :
      `BuildMart AI - Construction Materials\n${shareUrl}`
    );

    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const shareWithContractor = (contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    if (!contractor) return;

    const shareText = product ? 
      `Hi ${contractor.name}, I found this product that might be useful for your projects: ${product.name} at ₹${product.basePrice}. Check it out on BuildMart AI!` :
      `Hi ${contractor.name}, check out BuildMart AI for quality construction materials!`;

    // Simulate sending message
    toast({
      title: "Message Sent!",
      description: `Shared with ${contractor.name}`,
    });
  };

  const toggleContractorSelection = (contractorId: string) => {
    setSelectedContractors(prev => 
      prev.includes(contractorId) 
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    );
  };

  const shareWithSelectedContractors = () => {
    if (selectedContractors.length === 0) return;

    selectedContractors.forEach(id => shareWithContractor(id));
    setSelectedContractors([]);
    
    toast({
      title: "Shared Successfully!",
      description: `Shared with ${selectedContractors.length} contractor(s)`,
    });
  };

  const renderShareTab = () => (
    <div className="space-y-6">
      {/* Share Message */}
      <div>
        <label className="text-sm font-medium mb-2 block">Customize your message</label>
        <Textarea
          value={shareMessage}
          onChange={(e) => setShareMessage(e.target.value)}
          placeholder={product ? 
            `Check out this ${product.name} - perfect for construction projects!` :
            "Found this amazing construction material marketplace!"
          }
          rows={3}
        />
      </div>

      {/* Product Preview */}
      {product && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                <p className="text-lg font-bold text-green-600 mt-1">₹{parseFloat(product.basePrice).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media Buttons */}
      <div>
        <label className="text-sm font-medium mb-3 block">Share on social media</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            onClick={() => shareToSocialMedia('facebook')}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
          >
            <Facebook className="w-4 h-4 text-blue-600" />
            Facebook
          </Button>
          <Button 
            variant="outline" 
            onClick={() => shareToSocialMedia('twitter')}
            className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100"
          >
            <Twitter className="w-4 h-4 text-sky-600" />
            Twitter
          </Button>
          <Button 
            variant="outline" 
            onClick={() => shareToSocialMedia('whatsapp')}
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100"
          >
            <Phone className="w-4 h-4 text-green-600" />
            WhatsApp
          </Button>
          <Button 
            variant="outline" 
            onClick={() => shareToSocialMedia('linkedin')}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
          >
            <Users className="w-4 h-4 text-blue-700" />
            LinkedIn
          </Button>
        </div>
      </div>

      {/* Direct Share Options */}
      <div>
        <label className="text-sm font-medium mb-3 block">Direct sharing</label>
        <div className="flex gap-3">
          <Button variant="outline" onClick={copyToClipboard} className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNetworkTab = () => (
    <div className="space-y-6">
      {/* Search Contractors */}
      <div>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              value={searchContractors}
              onChange={(e) => setSearchContractors(e.target.value)}
              placeholder="Search contractors by name, specialization, or location..."
              className="pl-10"
            />
          </div>
          {selectedContractors.length > 0 && (
            <Button onClick={shareWithSelectedContractors}>
              <Send className="w-4 h-4 mr-2" />
              Share ({selectedContractors.length})
            </Button>
          )}
        </div>
      </div>

      {/* Contractor List */}
      <div className="space-y-4">
        {filteredContractors.map(contractor => (
          <Card key={contractor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-500" />
                  </div>
                  {contractor.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {contractor.name}
                        {contractor.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                      </h3>
                      <p className="text-sm text-gray-600">{contractor.specialization}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{contractor.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">{contractor.completedProjects} projects</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {contractor.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {contractor.experience} years exp.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {contractor.services.slice(0, 3).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => shareWithContractor(contractor.id)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedContractors.includes(contractor.id) ? "default" : "outline"}
                      onClick={() => toggleContractorSelection(contractor.id)}
                    >
                      {selectedContractors.includes(contractor.id) ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1" />
                      )}
                      {selectedContractors.includes(contractor.id) ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommunityTab = () => (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold">2,450+</p>
            <p className="text-sm text-gray-600">Active Contractors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold">8,900+</p>
            <p className="text-sm text-gray-600">Projects Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold">4.8/5</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Community Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Recent Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              user: "Rajesh Construction",
              action: "shared a project",
              item: "Luxury Villa in Gurgaon - 5000 sq ft",
              time: "2 hours ago",
              likes: 24
            },
            {
              user: "Modern Builders",
              action: "recommended",
              item: product?.name || "UltraTech Cement",
              time: "4 hours ago", 
              likes: 18
            },
            {
              user: "Green Construction",
              action: "completed project",
              item: "Eco-friendly Office Complex",
              time: "6 hours ago",
              likes: 35
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                  <span className="font-semibold">{activity.item}</span>
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
                    <ThumbsUp className="w-3 h-3" />
                    {activity.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Join Community CTA */}
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Join the BuildMart Community</h3>
          <p className="text-gray-600 mb-4">
            Connect with contractors, share projects, and grow your construction network
          </p>
          <div className="flex gap-3 justify-center">
            <Button>
              Join Community
            </Button>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getTitle = () => {
    switch (shareType) {
      case 'product':
        return `Share ${product?.name || 'Product'}`;
      case 'project':
        return 'Share Project';
      case 'contractor_network':
        return 'Contractor Network';
      default:
        return 'Share & Connect';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-blue-600" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            Share products, connect with contractors, and build your professional network
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">Share Product</TabsTrigger>
            <TabsTrigger value="network">Contractor Network</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="mt-6">
            {renderShareTab()}
          </TabsContent>

          <TabsContent value="network" className="mt-6">
            {renderNetworkTab()}
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            {renderCommunityTab()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}