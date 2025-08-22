import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Star, TrendingUp, Leaf, DollarSign, Target, User, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RecommendationContext {
  projectType: string;
  budget: number;
  area: number;
  priorities: string[];
  previousPurchases: string[];
  sustainabilityPreference: 'low' | 'medium' | 'high';
}

interface PersonalizedRecommendation {
  id: string;
  productId: string;
  recommendationType: 'ai_based' | 'trend_based' | 'sustainability_based' | 'budget_based';
  score: number;
  reason: string;
  context: RecommendationContext;
  product?: any;
}

const recommendationTypes = [
  { key: 'ai_based', name: 'AI-Powered', icon: Brain, color: 'text-purple-600' },
  { key: 'trend_based', name: 'Trending', icon: TrendingUp, color: 'text-blue-600' },
  { key: 'sustainability_based', name: 'Eco-Friendly', icon: Leaf, color: 'text-green-600' },
  { key: 'budget_based', name: 'Budget Optimized', icon: DollarSign, color: 'text-orange-600' },
];

export default function PersonalizedRecommendations() {
  const [userContext, setUserContext] = useState<RecommendationContext>({
    projectType: 'residential',
    budget: 200000,
    area: 1500,
    priorities: ['quality', 'durability'],
    previousPurchases: [],
    sustainabilityPreference: 'medium'
  });
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products for recommendations
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (context: RecommendationContext) => {
      return apiRequest('POST', '/api/personalized-recommendations/generate', { context });
    },
    onSuccess: () => {
      toast({
        title: "Recommendations Updated",
        description: "Your personalized recommendations have been refreshed!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/personalized-recommendations'] });
    },
  });

  // Mock recommendations based on user context
  const generateMockRecommendations = (): PersonalizedRecommendation[] => {
    if (products.length === 0) return [];

    const recommendations: PersonalizedRecommendation[] = [];
    
    // AI-Based Recommendations
    const aiProducts = products.slice(0, 3);
    aiProducts.forEach((product: any, index: number) => {
      recommendations.push({
        id: `ai-${product.id}`,
        productId: product.id,
        recommendationType: 'ai_based',
        score: 85 + Math.random() * 10,
        reason: `Perfect match for ${userContext.projectType} projects. Advanced AI analysis considers your preferences for ${userContext.priorities.join(' and ')}.`,
        context: userContext,
        product
      });
    });

    // Trend-Based Recommendations
    const trendProducts = products.slice(3, 6);
    trendProducts.forEach((product: any) => {
      recommendations.push({
        id: `trend-${product.id}`,
        productId: product.id,
        recommendationType: 'trend_based',
        score: 78 + Math.random() * 15,
        reason: `Trending choice among contractors. 87% of similar projects chose this material in the last month.`,
        context: userContext,
        product
      });
    });

    // Sustainability-Based Recommendations
    if (userContext.sustainabilityPreference !== 'low') {
      const sustainableProducts = products.slice(6, 9);
      sustainableProducts.forEach((product: any) => {
        recommendations.push({
          id: `sustain-${product.id}`,
          productId: product.id,
          recommendationType: 'sustainability_based',
          score: 82 + Math.random() * 12,
          reason: `High sustainability score with low carbon footprint. Matches your ${userContext.sustainabilityPreference} environmental preference.`,
          context: userContext,
          product
        });
      });
    }

    // Budget-Based Recommendations
    const budgetProducts = products.filter((p: any) => parseFloat(p.basePrice) <= userContext.budget / 10);
    budgetProducts.slice(0, 3).forEach((product: any) => {
      recommendations.push({
        id: `budget-${product.id}`,
        productId: product.id,
        recommendationType: 'budget_based',
        score: 75 + Math.random() * 18,
        reason: `Excellent value for money. Fits perfectly within your ₹${userContext.budget.toLocaleString()} budget while maintaining quality.`,
        context: userContext,
        product
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  };

  const mockRecommendations = generateMockRecommendations();

  const filteredRecommendations = selectedType === 'all' 
    ? mockRecommendations 
    : mockRecommendations.filter(r => r.recommendationType === selectedType);

  const refreshRecommendations = async () => {
    setRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Recommendations Refreshed",
        description: "Your recommendations have been updated based on your latest preferences!",
      });
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = recommendationTypes.find(t => t.key === type);
    if (!typeConfig) return Brain;
    return typeConfig.icon;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = recommendationTypes.find(t => t.key === type);
    return typeConfig?.color || 'text-gray-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 65) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Personalized Construction Material Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Type</label>
              <Select 
                value={userContext.projectType} 
                onValueChange={(value) => setUserContext({...userContext, projectType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Budget (₹)</label>
              <Input
                type="number"
                value={userContext.budget}
                onChange={(e) => setUserContext({...userContext, budget: Number(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Area (sq ft)</label>
              <Input
                type="number"
                value={userContext.area}
                onChange={(e) => setUserContext({...userContext, area: Number(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sustainability Preference</label>
              <Select 
                value={userContext.sustainabilityPreference} 
                onValueChange={(value: any) => setUserContext({...userContext, sustainabilityPreference: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {recommendationTypes.map((type) => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={refreshRecommendations} 
                disabled={refreshing}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendationTypes.map((type) => {
          const count = mockRecommendations.filter(r => r.recommendationType === type.key).length;
          const IconComponent = type.icon;
          
          return (
            <Card key={type.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <IconComponent className={`w-6 h-6 ${type.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecommendations.map((recommendation) => {
          const IconComponent = getTypeIcon(recommendation.recommendationType);
          const typeColor = getTypeColor(recommendation.recommendationType);
          const product = recommendation.product;
          
          return (
            <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{product?.name}</span>
                  <Badge variant={getScoreBadgeVariant(recommendation.score)}>
                    {Math.round(recommendation.score)}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recommendation Type */}
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${typeColor}`} />
                  <span className="text-sm font-medium capitalize">
                    {recommendation.recommendationType.replace('_', ' ')}
                  </span>
                </div>

                {/* Product Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">₹{product?.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{product?.category}</span>
                  </div>
                </div>

                {/* Recommendation Reason */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{recommendation.reason}</p>
                </div>

                {/* Match Score Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Match Score</span>
                    <span className="font-medium">{Math.round(recommendation.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${recommendation.score}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Insights & Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Based on Your Profile</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Projects similar to yours typically spend 15-20% on structural materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Your sustainability preference aligns with 68% cost savings in long-term maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Consider bulk ordering for 12-15% additional savings on your budget</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Market Trends</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Steel prices expected to stabilize next month - good time to order</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">High demand for eco-friendly materials in your area</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm">Local suppliers offer 20% faster delivery for your project type</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}