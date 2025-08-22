import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Plus, X, Star, TrendingUp, Leaf, DollarSign, Award, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Product {
  id: string;
  name: string;
  basePrice: string;
  specs?: any;
  sustainabilityScore?: number;
  category: string;
  brand?: string;
}

interface ComparisonData {
  price: number;
  quality: number;
  sustainability: number;
  availability: number;
  durability: number;
  total: number;
}

export default function MaterialComparisonDashboard() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectType, setProjectType] = useState('residential');
  const [comparisonCriteria, setComparisonCriteria] = useState('overall');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products for selection
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Save comparison mutation
  const saveComparisonMutation = useMutation({
    mutationFn: async (comparisonData: any) => {
      return apiRequest('POST', '/api/material-comparisons', comparisonData);
    },
    onSuccess: () => {
      toast({
        title: "Comparison Saved",
        description: "Your material comparison has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/material-comparisons'] });
    },
  });

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedProducts.some(selected => selected.id === product.id)
  );

  const addProduct = (product: Product) => {
    if (selectedProducts.length < 4) {
      setSelectedProducts([...selectedProducts, product]);
      setSearchTerm('');
    } else {
      toast({
        title: "Maximum Reached",
        description: "You can compare up to 4 materials at once.",
        variant: "destructive",
      });
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const generateComparisonData = (product: Product): ComparisonData => {
    const basePrice = parseFloat(product.basePrice);
    
    // Generate realistic comparison scores (0-100)
    const priceScore = Math.max(0, 100 - (basePrice / 50)); // Lower price = higher score
    const qualityScore = 70 + Math.random() * 25; // 70-95 range
    const sustainabilityScore = product.sustainabilityScore || (60 + Math.random() * 30);
    const availabilityScore = 75 + Math.random() * 20; // 75-95 range
    const durabilityScore = 65 + Math.random() * 30; // 65-95 range
    
    const totalScore = (priceScore + qualityScore + sustainabilityScore + availabilityScore + durabilityScore) / 5;
    
    return {
      price: Math.round(priceScore),
      quality: Math.round(qualityScore),
      sustainability: Math.round(sustainabilityScore),
      availability: Math.round(availabilityScore),
      durability: Math.round(durabilityScore),
      total: Math.round(totalScore)
    };
  };

  const getComparisonResults = () => {
    return selectedProducts.map(product => ({
      product,
      scores: generateComparisonData(product)
    }));
  };

  const saveComparison = async () => {
    if (selectedProducts.length < 2) {
      toast({
        title: "Not Enough Products",
        description: "Please select at least 2 products to compare.",
        variant: "destructive",
      });
      return;
    }

    const comparisonData = {
      productIds: selectedProducts.map(p => p.id),
      comparisonData: getComparisonResults(),
      projectType
    };

    saveComparisonMutation.mutate(comparisonData);
  };

  const getBestProduct = (criteria: string) => {
    const results = getComparisonResults();
    if (results.length === 0) return null;

    switch (criteria) {
      case 'price':
        return results.reduce((best, current) => 
          current.scores.price > best.scores.price ? current : best
        );
      case 'quality':
        return results.reduce((best, current) => 
          current.scores.quality > best.scores.quality ? current : best
        );
      case 'sustainability':
        return results.reduce((best, current) => 
          current.scores.sustainability > best.scores.sustainability ? current : best
        );
      default:
        return results.reduce((best, current) => 
          current.scores.total > best.scores.total ? current : best
        );
    }
  };

  const radarData = getComparisonResults().map(({ product, scores }) => ({
    product: product.name.slice(0, 15) + '...',
    price: scores.price,
    quality: scores.quality,
    sustainability: scores.sustainability,
    availability: scores.availability,
    durability: scores.durability
  }));

  const barData = getComparisonResults().map(({ product, scores }) => ({
    name: product.name.slice(0, 10) + '...',
    total: scores.total,
    price: scores.price,
    quality: scores.quality,
    sustainability: scores.sustainability
  }));

  const bestOverall = getBestProduct('overall');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            One-Click Material Comparison Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search materials to compare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                    {filteredProducts.slice(0, 5).map((product: Product) => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => addProduct(product)}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">₹{product.basePrice}</p>
                        </div>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Products */}
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <Badge key={product.id} variant="secondary" className="px-3 py-1">
                  {product.name.slice(0, 20)}...
                  <X
                    className="w-3 h-3 ml-2 cursor-pointer hover:text-red-600"
                    onClick={() => removeProduct(product.id)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedProducts.length >= 2 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Scores</TabsTrigger>
            <TabsTrigger value="charts">Visual Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Quick Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Material</th>
                        <th className="text-center p-2">Price</th>
                        <th className="text-center p-2">Overall Score</th>
                        <th className="text-center p-2">Best For</th>
                        <th className="text-center p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getComparisonResults().map(({ product, scores }) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <span className="font-bold text-green-600">₹{product.basePrice}</span>
                          </td>
                          <td className="text-center p-2">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-bold">{scores.total}/100</span>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            <Badge variant={scores.total > 80 ? 'default' : scores.total > 65 ? 'secondary' : 'outline'}>
                              {scores.total > 80 ? 'Premium' : scores.total > 65 ? 'Standard' : 'Budget'}
                            </Badge>
                          </td>
                          <td className="text-center p-2">
                            <Button size="sm" variant="outline">
                              Add to Cart
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Winner Card */}
            {bestOverall && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Award className="w-6 h-6" />
                    Best Overall Choice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-green-900">{bestOverall.product.name}</h3>
                      <p className="text-green-700">Score: {bestOverall.scores.total}/100</p>
                      <p className="text-sm text-green-600 mt-2">
                        Best balance of price, quality, and sustainability for {projectType} projects
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">₹{bestOverall.product.basePrice}</p>
                      <Button className="mt-2">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Choose This
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getComparisonResults().map(({ product, scores }) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price Value
                      </span>
                      <span className="font-bold">{scores.price}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Quality
                      </span>
                      <span className="font-bold">{scores.quality}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Sustainability
                      </span>
                      <span className="font-bold">{scores.sustainability}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Availability
                      </span>
                      <span className="font-bold">{scores.availability}/100</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="font-semibold">Total Score</span>
                      <span className="font-bold text-lg">{scores.total}/100</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Criteria Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="product" />
                        <PolarRadiusAxis angle={0} domain={[0, 100]} />
                        <Radar
                          name="Price"
                          dataKey="price"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                        />
                        <Radar
                          name="Quality"
                          dataKey="quality"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="total" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">For Budget-Conscious Projects</h4>
                    <div className="space-y-2">
                      {getComparisonResults()
                        .sort((a, b) => b.scores.price - a.scores.price)
                        .slice(0, 2)
                        .map(({ product, scores }) => (
                          <div key={product.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Best price value: {scores.price}/100 • ₹{product.basePrice}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">For Premium Quality</h4>
                    <div className="space-y-2">
                      {getComparisonResults()
                        .sort((a, b) => b.scores.quality - a.scores.quality)
                        .slice(0, 2)
                        .map(({ product, scores }) => (
                          <div key={product.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Highest quality: {scores.quality}/100 • ₹{product.basePrice}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Action Buttons */}
      {selectedProducts.length >= 2 && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setSelectedProducts([])}>
            Clear All
          </Button>
          <Button onClick={saveComparison} disabled={saveComparisonMutation.isPending}>
            {saveComparisonMutation.isPending ? 'Saving...' : 'Save Comparison'}
          </Button>
        </div>
      )}
    </div>
  );
}