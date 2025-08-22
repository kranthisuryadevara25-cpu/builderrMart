import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Award, Recycle, Zap, MapPin, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface SustainabilityData {
  id: string;
  productId: string;
  carbonFootprint: number;
  recyclabilityScore: number;
  energyEfficiency: number;
  localSourcing: boolean;
  certifications: string[];
  environmentalImpact: 'low' | 'medium' | 'high';
  overallScore: number;
  productName?: string;
}

interface ProductWithSustainability {
  id: string;
  name: string;
  basePrice: string;
  category: string;
  sustainability: SustainabilityData;
}

const sustainabilityCategories = [
  { key: 'carbonFootprint', name: 'Carbon Footprint', icon: Leaf, unit: 'kg CO₂e', color: '#10b981' },
  { key: 'recyclabilityScore', name: 'Recyclability', icon: Recycle, unit: '/100', color: '#3b82f6' },
  { key: 'energyEfficiency', name: 'Energy Efficiency', icon: Zap, unit: '/100', color: '#f59e0b' },
  { key: 'localSourcing', name: 'Local Sourcing', icon: MapPin, unit: 'Yes/No', color: '#8b5cf6' },
];

const certificationColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SustainabilityScorer() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('overallScore');

  // Fetch products with sustainability data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Mock sustainability data since we don't have the backend endpoint yet
  const mockSustainabilityData: ProductWithSustainability[] = products.slice(0, 10).map((product: any) => ({
    ...product,
    sustainability: {
      id: `sus-${product.id}`,
      productId: product.id,
      carbonFootprint: Math.random() * 50 + 10, // 10-60 kg CO2e
      recyclabilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      energyEfficiency: Math.floor(Math.random() * 30) + 70, // 70-100
      localSourcing: Math.random() > 0.5,
      certifications: ['Green Building Council', 'LEED Certified'].filter(() => Math.random() > 0.6),
      environmentalImpact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
      productName: product.name
    }
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredProducts = mockSustainabilityData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesScore = product.sustainability.overallScore >= minScore;
    return matchesSearch && matchesCategory && matchesScore;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'overallScore':
        return b.sustainability.overallScore - a.sustainability.overallScore;
      case 'carbonFootprint':
        return a.sustainability.carbonFootprint - b.sustainability.carbonFootprint; // Lower is better
      case 'recyclability':
        return b.sustainability.recyclabilityScore - a.sustainability.recyclabilityScore;
      case 'energyEfficiency':
        return b.sustainability.energyEfficiency - a.sustainability.energyEfficiency;
      default:
        return 0;
    }
  });

  const categoryAverages = mockSustainabilityData.reduce((acc: any, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0, carbonFootprint: 0, recyclability: 0, energy: 0 };
    }
    acc[category].total += product.sustainability.overallScore;
    acc[category].carbonFootprint += product.sustainability.carbonFootprint;
    acc[category].recyclability += product.sustainability.recyclabilityScore;
    acc[category].energy += product.sustainability.energyEfficiency;
    acc[category].count += 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryAverages).map(([category, data]: [string, any]) => ({
    category,
    averageScore: Math.round(data.total / data.count),
    avgCarbon: Math.round(data.carbonFootprint / data.count),
    avgRecyclability: Math.round(data.recyclability / data.count),
    avgEnergy: Math.round(data.energy / data.count)
  }));

  const impactDistribution = [
    { name: 'Low Impact', value: mockSustainabilityData.filter(p => p.sustainability.environmentalImpact === 'low').length, color: '#10b981' },
    { name: 'Medium Impact', value: mockSustainabilityData.filter(p => p.sustainability.environmentalImpact === 'medium').length, color: '#f59e0b' },
    { name: 'High Impact', value: mockSustainabilityData.filter(p => p.sustainability.environmentalImpact === 'high').length, color: '#ef4444' }
  ];

  const topSustainableProducts = sortedProducts.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            AI-Powered Material Sustainability Scorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cement">Cement</SelectItem>
                <SelectItem value="Steel">Steel</SelectItem>
                <SelectItem value="Bricks">Bricks</SelectItem>
                <SelectItem value="Metal">Metal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overallScore">Overall Score</SelectItem>
                <SelectItem value="carbonFootprint">Carbon Footprint</SelectItem>
                <SelectItem value="recyclability">Recyclability</SelectItem>
                <SelectItem value="energyEfficiency">Energy Efficiency</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Min Score"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Product Scores</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedProducts.map((product) => {
              const sustainability = product.sustainability;
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{product.name}</span>
                      <Badge variant={getScoreBadgeVariant(sustainability.overallScore)}>
                        {sustainability.overallScore}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Overall Score Radial */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-24 h-24">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart data={[{ score: sustainability.overallScore }]}>
                            <RadialBar
                              dataKey="score"
                              startAngle={90}
                              endAngle={-270}
                              fill={sustainability.overallScore >= 80 ? '#10b981' : 
                                   sustainability.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                              cornerRadius={10}
                              innerRadius="60%"
                              outerRadius="90%"
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">{sustainability.overallScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Individual Scores */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm">
                          <Leaf className="w-4 h-4 text-green-600" />
                          Carbon Footprint
                        </span>
                        <span className="text-sm font-medium">{sustainability.carbonFootprint.toFixed(1)} kg CO₂e</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm">
                          <Recycle className="w-4 h-4 text-blue-600" />
                          Recyclability
                        </span>
                        <span className="text-sm font-medium">{sustainability.recyclabilityScore}/100</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-yellow-600" />
                          Energy Efficiency
                        </span>
                        <span className="text-sm font-medium">{sustainability.energyEfficiency}/100</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          Local Sourcing
                        </span>
                        <span className="text-sm font-medium">
                          {sustainability.localSourcing ? '✓ Yes' : '✗ No'}
                        </span>
                      </div>
                    </div>

                    {/* Environmental Impact */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Environmental Impact</span>
                      <Badge className={getImpactColor(sustainability.environmentalImpact)}>
                        {sustainability.environmentalImpact.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Certifications */}
                    {sustainability.certifications.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Certifications:</span>
                        <div className="flex flex-wrap gap-1">
                          {sustainability.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price</span>
                        <span className="font-medium">₹{product.basePrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Sustainability by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Impact Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={impactDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {impactDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sustainability Leaders */}
          <Card>
            <CardHeader>
              <CardTitle>Top Sustainable Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSustainableProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{product.sustainability.overallScore}/100</p>
                      <p className="text-xs text-gray-500">
                        {product.sustainability.carbonFootprint.toFixed(1)} kg CO₂e
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Eco-Friendly Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">For Residential Projects</h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Choose locally sourced materials (reduces transport emissions)</li>
                    <li>• Opt for recycled steel and concrete where possible</li>
                    <li>• Consider AAC blocks over traditional bricks</li>
                    <li>• Use low-carbon cement alternatives</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">For Commercial Projects</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Prioritize materials with green certifications</li>
                    <li>• Implement circular economy principles</li>
                    <li>• Focus on durability to reduce replacement needs</li>
                    <li>• Consider energy-efficient building systems</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Carbon Footprint Reduction</h4>
                  <ul className="space-y-1 text-sm text-orange-700">
                    <li>• Switch to renewable energy in production</li>
                    <li>• Optimize transportation and logistics</li>
                    <li>• Implement carbon offset programs</li>
                    <li>• Invest in cleaner production technologies</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Recycling & Circular Economy</h4>
                  <ul className="space-y-1 text-sm text-purple-700">
                    <li>• Develop take-back programs for end-of-life materials</li>
                    <li>• Design products for disassembly</li>
                    <li>• Partner with recycling facilities</li>
                    <li>• Create material passports for traceability</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Green Building Certifications Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">LEED Certified</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Leadership in Energy and Environmental Design certification for sustainable building materials.
                  </p>
                  <Badge variant="outline">High Impact</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">Green Building Council</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Indian Green Building Council certification for environmentally responsible materials.
                  </p>
                  <Badge variant="outline">Regional Standard</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">BREEAM</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Building Research Establishment Environmental Assessment Method for sustainable construction.
                  </p>
                  <Badge variant="outline">International</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">Cradle to Cradle</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Certification focused on material health and circular economy principles.
                  </p>
                  <Badge variant="outline">Circular Economy</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold">Energy Star</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Certification for energy-efficient building products and materials.
                  </p>
                  <Badge variant="outline">Energy Focus</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-teal-600" />
                    <h4 className="font-semibold">FSC Certified</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Forest Stewardship Council certification for responsibly sourced wood materials.
                  </p>
                  <Badge variant="outline">Forestry</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}