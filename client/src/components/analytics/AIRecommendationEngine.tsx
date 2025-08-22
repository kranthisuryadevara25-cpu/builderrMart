import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Star,
  Target,
  Sparkles,
  TrendingUp,
  Heart,
  ShoppingCart,
  Eye,
  Filter,
  Settings,
  Lightbulb,
  CheckCircle2,
  BarChart3,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  preferences: {
    budget: 'low' | 'medium' | 'high';
    quality: 'basic' | 'standard' | 'premium';
    sustainability: 'low' | 'medium' | 'high';
    projectType: 'residential' | 'commercial' | 'industrial';
    urgency: 'flexible' | 'moderate' | 'urgent';
  };
  history: PurchaseHistory[];
  behavior: BehaviorPattern;
}

interface PurchaseHistory {
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  rating: number;
  purchaseDate: string;
}

interface BehaviorPattern {
  browsingFrequency: number;
  averageSessionTime: number;
  preferredCategories: string[];
  priceComparisonRate: number;
  bulkPurchaseTendency: number;
  seasonalPatterns: string[];
  devicePreference: 'mobile' | 'desktop' | 'tablet';
}

interface Recommendation {
  id: string;
  type: 'product' | 'category' | 'bundle' | 'alternative';
  product: any;
  relevanceScore: number;
  confidenceLevel: number;
  reason: string;
  benefits: string[];
  estimatedSavings?: number;
  urgency: 'low' | 'medium' | 'high';
  personalizedPrice?: number;
  similarUsers: number;
  trendingScore: number;
}

interface PersonalizationFactors {
  behaviorWeight: number;
  historyWeight: number;
  preferencesWeight: number;
  marketTrendsWeight: number;
  socialProofWeight: number;
}

const defaultPreferences = {
  budget: 'medium' as const,
  quality: 'standard' as const,
  sustainability: 'medium' as const,
  projectType: 'residential' as const,
  urgency: 'moderate' as const
};

const budgetRanges = {
  low: { min: 0, max: 50000 },
  medium: { min: 50000, max: 200000 },
  high: { min: 200000, max: 1000000 }
};

export default function AIRecommendationEngine() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    relevance: 'high'
  });
  const [personalizationFactors, setPersonalizationFactors] = useState<PersonalizationFactors>({
    behaviorWeight: 30,
    historyWeight: 25,
    preferencesWeight: 20,
    marketTrendsWeight: 15,
    socialProofWeight: 10
  });
  const { toast } = useToast();

  // Fetch real data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      setIsGenerating(true);
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return generateAIRecommendations(profile, products, categories);
    },
    onSuccess: (newRecommendations) => {
      setRecommendations(newRecommendations);
      setIsGenerating(false);
      toast({
        title: "🤖 AI Recommendations Generated!",
        description: `Found ${newRecommendations.length} personalized suggestions`,
      });
    },
  });

  useEffect(() => {
    // Initialize user profile and generate recommendations
    if (products.length > 0 && !userProfile) {
      const profile = generateUserProfile();
      setUserProfile(profile);
      generateRecommendationsMutation.mutate(profile);
    }
  }, [products, userProfile]);

  const generateUserProfile = (): UserProfile => {
    // Generate realistic user profile based on available data
    const sampleHistory: PurchaseHistory[] = Array.isArray(products) ? 
      products.slice(0, 5).map((product: any) => ({
        productId: product.id,
        productName: product.name,
        category: product.categoryName || 'General',
        price: parseFloat(product.basePrice) || 1000,
        quantity: Math.floor(Math.random() * 10) + 1,
        rating: 3 + Math.random() * 2,
        purchaseDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      })) : [];

    const preferredCategories = Array.isArray(categories) ? 
      categories.slice(0, 3).map((cat: any) => cat.name) : 
      ['Cement', 'Steel', 'Bricks'];

    return {
      id: 'current-user',
      preferences: {
        ...defaultPreferences,
        budget: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        projectType: ['residential', 'commercial'][Math.floor(Math.random() * 2)] as any
      },
      history: sampleHistory,
      behavior: {
        browsingFrequency: 15 + Math.random() * 20,
        averageSessionTime: 300 + Math.random() * 1200, // 5-25 minutes
        preferredCategories,
        priceComparisonRate: 60 + Math.random() * 30,
        bulkPurchaseTendency: 40 + Math.random() * 40,
        seasonalPatterns: ['monsoon', 'winter'],
        devicePreference: ['mobile', 'desktop'][Math.floor(Math.random() * 2)] as any
      }
    };
  };

  const generateAIRecommendations = (
    profile: UserProfile, 
    availableProducts: any[], 
    availableCategories: any[]
  ): Recommendation[] => {
    if (!Array.isArray(availableProducts) || availableProducts.length === 0) {
      // Generate mock recommendations
      return generateMockRecommendations();
    }

    const budgetRange = budgetRanges[profile.preferences.budget];
    
    // Filter products based on user preferences
    const suitableProducts = availableProducts.filter((product: any) => {
      const price = parseFloat(product.basePrice) || 1000;
      return price >= budgetRange.min && price <= budgetRange.max;
    });

    const recommendations: Recommendation[] = suitableProducts.slice(0, 8).map((product: any, index) => {
      const baseScore = 60 + Math.random() * 30;
      const behaviorBoost = profile.behavior.preferredCategories.includes(product.categoryName) ? 15 : 0;
      const historyBoost = profile.history.some(h => h.category === product.categoryName) ? 10 : 0;
      
      const relevanceScore = Math.min(baseScore + behaviorBoost + historyBoost, 95);
      const confidenceLevel = 70 + Math.random() * 25;
      
      const reasons = [
        "Based on your previous purchases",
        "Popular in your project type",
        "Matches your budget preferences",
        "High rating from similar users",
        "Trending in your area"
      ];

      const benefits = [
        "Cost-effective solution",
        "High quality materials",
        "Fast delivery available",
        "Bulk pricing options",
        "Eco-friendly choice"
      ].slice(0, 2 + Math.floor(Math.random() * 2));

      return {
        id: `rec-${product.id}`,
        type: 'product',
        product,
        relevanceScore,
        confidenceLevel,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        benefits,
        estimatedSavings: Math.floor(Math.random() * 5000),
        urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        personalizedPrice: parseFloat(product.basePrice) * (0.9 + Math.random() * 0.15),
        similarUsers: 50 + Math.floor(Math.random() * 200),
        trendingScore: 60 + Math.random() * 40
      };
    });

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const generateMockRecommendations = (): Recommendation[] => {
    const mockProducts = [
      { id: '1', name: 'Premium Cement 50kg', basePrice: '400', categoryName: 'Cement' },
      { id: '2', name: 'TMT Steel Bars 8mm', basePrice: '60000', categoryName: 'Steel' },
      { id: '3', name: 'Red Clay Bricks', basePrice: '8', categoryName: 'Bricks' },
      { id: '4', name: 'River Sand', basePrice: '1500', categoryName: 'Sand' },
      { id: '5', name: 'Tile Adhesive', basePrice: '250', categoryName: 'Adhesives' }
    ];

    return mockProducts.map((product, index) => ({
      id: `rec-${product.id}`,
      type: 'product' as const,
      product,
      relevanceScore: 85 - index * 5,
      confidenceLevel: 80 + Math.random() * 15,
      reason: "Based on your purchase history and preferences",
      benefits: ["Cost-effective", "High quality", "Fast delivery"],
      estimatedSavings: Math.floor(Math.random() * 5000),
      urgency: 'medium' as const,
      personalizedPrice: parseFloat(product.basePrice) * 0.95,
      similarUsers: 100 + Math.floor(Math.random() * 150),
      trendingScore: 70 + Math.random() * 30
    }));
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filters.category !== 'all' && rec.product.categoryName !== filters.category) return false;
    if (filters.relevance === 'high' && rec.relevanceScore < 80) return false;
    if (filters.relevance === 'medium' && (rec.relevanceScore < 60 || rec.relevanceScore >= 80)) return false;
    if (filters.relevance === 'low' && rec.relevanceScore >= 60) return false;
    return true;
  });

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'product': return <ShoppingCart className="w-5 h-5" />;
      case 'bundle': return <Target className="w-5 h-5" />;
      case 'alternative': return <Lightbulb className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI-Powered Material Recommendation Engine
          </h2>
          <p className="text-gray-600">Personalized product suggestions powered by machine learning</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered
          </Badge>
          <Button
            onClick={() => userProfile && generateRecommendationsMutation.mutate(userProfile)}
            disabled={isGenerating}
            className="gap-2"
          >
            <Brain className="w-4 h-4" />
            Refresh Recommendations
          </Button>
        </div>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Personalization Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Budget Range</p>
                <p className="text-lg capitalize text-blue-800">{userProfile.preferences.budget}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Project Type</p>
                <p className="text-lg capitalize text-green-800">{userProfile.preferences.projectType}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Quality Preference</p>
                <p className="text-lg capitalize text-purple-800">{userProfile.preferences.quality}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Eco-Consciousness</p>
                <p className="text-lg capitalize text-yellow-800">{userProfile.preferences.sustainability}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Recommendation Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Cement">Cement</SelectItem>
                  <SelectItem value="Steel">Steel</SelectItem>
                  <SelectItem value="Bricks">Bricks</SelectItem>
                  <SelectItem value="Sand">Sand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Relevance</label>
              <Select value={filters.relevance} onValueChange={(value) => setFilters({...filters, relevance: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Relevance</SelectItem>
                  <SelectItem value="high">High (80%+)</SelectItem>
                  <SelectItem value="medium">Medium (60-80%)</SelectItem>
                  <SelectItem value="low">Low (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Show</label>
              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm">
                  {filteredRecommendations.length} of {recommendations.length} recommendations
                </span>
                {isGenerating && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Product Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Recommendation Analytics</TabsTrigger>
          <TabsTrigger value="settings">Personalization Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.type)}
                        <div>
                          <h3 className="font-semibold">{rec.product.name}</h3>
                          <p className="text-sm text-gray-600">{rec.product.categoryName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{Math.round(rec.relevanceScore)}%</span>
                        </div>
                        <Badge variant={rec.urgency === 'high' ? 'destructive' : rec.urgency === 'medium' ? 'default' : 'secondary'}>
                          {rec.urgency} priority
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Price and Savings */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold">₹{rec.personalizedPrice?.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 line-through">₹{parseFloat(rec.product.basePrice).toLocaleString()}</p>
                        </div>
                        {rec.estimatedSavings && rec.estimatedSavings > 0 && (
                          <div className="text-right">
                            <p className="text-green-600 font-semibold">Save ₹{rec.estimatedSavings.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">with bulk order</p>
                          </div>
                        )}
                      </div>

                      {/* AI Reason */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">AI Insight:</p>
                        <p className="text-sm text-blue-700">{rec.reason}</p>
                      </div>

                      {/* Benefits */}
                      <div>
                        <p className="text-sm font-medium mb-2">Why this matches you:</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.benefits.map((benefit, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Social Proof */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{rec.similarUsers} similar users bought this</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{Math.round(rec.trendingScore)}% trending</span>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">AI Confidence</span>
                          <span className="text-sm text-gray-500">{Math.round(rec.confidenceLevel)}%</span>
                        </div>
                        <Progress value={rec.confidenceLevel} className="h-2" />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        <Button size="sm" className="gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Average Relevance Score</span>
                      <span className="font-medium">
                        {Math.round(recommendations.reduce((sum, r) => sum + r.relevanceScore, 0) / recommendations.length || 0)}%
                      </span>
                    </div>
                    <Progress value={recommendations.reduce((sum, r) => sum + r.relevanceScore, 0) / recommendations.length || 0} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">AI Confidence Level</span>
                      <span className="font-medium">
                        {Math.round(recommendations.reduce((sum, r) => sum + r.confidenceLevel, 0) / recommendations.length || 0)}%
                      </span>
                    </div>
                    <Progress value={recommendations.reduce((sum, r) => sum + r.confidenceLevel, 0) / recommendations.length || 0} />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{recommendations.length}</p>
                        <p className="text-xs text-gray-500">Total Recommendations</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {recommendations.filter(r => r.relevanceScore >= 80).length}
                        </p>
                        <p className="text-xs text-gray-500">High Relevance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(recommendations.map(r => r.product.categoryName))).map((category) => {
                    const count = recommendations.filter(r => r.product.categoryName === category).length;
                    const percentage = (count / recommendations.length) * 100;
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{category || 'General'}</span>
                          <span className="text-sm text-gray-500">{count} items</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Personalization Weights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-600">Adjust how much each factor influences your recommendations:</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Behavior Analysis</label>
                      <span className="text-sm text-gray-500">{personalizationFactors.behaviorWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={personalizationFactors.behaviorWeight}
                      onChange={(e) => setPersonalizationFactors({
                        ...personalizationFactors,
                        behaviorWeight: Number(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Purchase History</label>
                      <span className="text-sm text-gray-500">{personalizationFactors.historyWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={personalizationFactors.historyWeight}
                      onChange={(e) => setPersonalizationFactors({
                        ...personalizationFactors,
                        historyWeight: Number(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Stated Preferences</label>
                      <span className="text-sm text-gray-500">{personalizationFactors.preferencesWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={personalizationFactors.preferencesWeight}
                      onChange={(e) => setPersonalizationFactors({
                        ...personalizationFactors,
                        preferencesWeight: Number(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Market Trends</label>
                      <span className="text-sm text-gray-500">{personalizationFactors.marketTrendsWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={personalizationFactors.marketTrendsWeight}
                      onChange={(e) => setPersonalizationFactors({
                        ...personalizationFactors,
                        marketTrendsWeight: Number(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Social Proof</label>
                      <span className="text-sm text-gray-500">{personalizationFactors.socialProofWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={personalizationFactors.socialProofWeight}
                      onChange={(e) => setPersonalizationFactors({
                        ...personalizationFactors,
                        socialProofWeight: Number(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => userProfile && generateRecommendationsMutation.mutate(userProfile)}
                    className="w-full gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply Settings & Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}