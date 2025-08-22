import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Leaf, 
  Recycle, 
  Zap, 
  MapPin, 
  Award, 
  Scale, 
  TrendingUp, 
  Star,
  CheckCircle2,
  BarChart3,
  Sparkles,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SustainabilityData {
  id: string;
  productId: string;
  productName: string;
  category: string;
  carbonFootprint: number;
  recyclabilityScore: number;
  energyEfficiency: number;
  localSourcing: boolean;
  certifications: string[];
  environmentalImpact: 'low' | 'medium' | 'high';
  overallScore: number;
  price: number;
  brand: string;
}

interface ComparisonWeights {
  carbonFootprint: number;
  recyclabilityScore: number;
  energyEfficiency: number;
  localSourcing: number;
  certifications: number;
  price: number;
}

const sustainabilityCategories = [
  { 
    key: 'carbonFootprint', 
    name: 'Carbon Footprint', 
    icon: Leaf, 
    unit: 'kg CO₂e',
    color: '#10b981',
    description: 'Environmental impact during production'
  },
  { 
    key: 'recyclabilityScore', 
    name: 'Recyclability', 
    icon: Recycle, 
    unit: '/100',
    color: '#3b82f6',
    description: 'How easily the material can be recycled'
  },
  { 
    key: 'energyEfficiency', 
    name: 'Energy Efficiency', 
    icon: Zap, 
    unit: '/100',
    color: '#f59e0b',
    description: 'Energy consumption during lifecycle'
  },
  { 
    key: 'localSourcing', 
    name: 'Local Sourcing', 
    icon: MapPin, 
    unit: 'Yes/No',
    color: '#8b5cf6',
    description: 'Sourced locally to reduce transportation impact'
  },
  { 
    key: 'certifications', 
    name: 'Certifications', 
    icon: Award, 
    unit: 'Count',
    color: '#06b6d4',
    description: 'Green building and environmental certifications'
  }
];

// Mock sustainability data
const generateMockSustainabilityData = (): SustainabilityData[] => {
  const materials = [
    { name: 'Premium Portland Cement', category: 'Cement', brand: 'EcoBuild' },
    { name: 'Steel Rebar Grade 60', category: 'Steel', brand: 'GreenSteel' },
    { name: 'Recycled Concrete Blocks', category: 'Bricks', brand: 'SustainaBrick' },
    { name: 'Bamboo Composite Panels', category: 'Panels', brand: 'EcoPanel' },
    { name: 'Low Carbon Concrete', category: 'Concrete', brand: 'CarbonLite' },
    { name: 'Solar Reflective Tiles', category: 'Tiles', brand: 'SolarTile' },
    { name: 'Recycled Steel Sheets', category: 'Steel', brand: 'ReSteel' },
    { name: 'Bio-based Insulation', category: 'Insulation', brand: 'BioTherm' }
  ];

  return materials.map((material, index) => ({
    id: `sus-${index}`,
    productId: `prod-${index}`,
    productName: material.name,
    category: material.category,
    brand: material.brand,
    carbonFootprint: Math.random() * 100 + 20,
    recyclabilityScore: Math.floor(Math.random() * 40) + 60,
    energyEfficiency: Math.floor(Math.random() * 30) + 70,
    localSourcing: Math.random() > 0.5,
    certifications: [
      'LEED', 'BREEAM', 'Green Star', 'GRIHA', 'IGBC'
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    environmentalImpact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    overallScore: Math.floor(Math.random() * 30) + 70,
    price: Math.floor(Math.random() * 500) + 100
  }));
};

export default function SustainabilityComparisonWizard() {
  const [step, setStep] = useState<'select' | 'weights' | 'results'>('select');
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [comparisonWeights, setComparisonWeights] = useState<ComparisonWeights>({
    carbonFootprint: 25,
    recyclabilityScore: 20,
    energyEfficiency: 20,
    localSourcing: 15,
    certifications: 10,
    price: 10
  });
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);

  useEffect(() => {
    setSustainabilityData(generateMockSustainabilityData());
  }, []);

  const filteredProducts = sustainabilityData.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(sustainabilityData.map(p => p.category)));

  const calculateWeightedScore = (product: SustainabilityData): number => {
    const scores = {
      carbonFootprint: Math.max(0, 100 - product.carbonFootprint), // Lower is better
      recyclabilityScore: product.recyclabilityScore,
      energyEfficiency: product.energyEfficiency,
      localSourcing: product.localSourcing ? 100 : 0,
      certifications: Math.min(100, product.certifications.length * 20),
      price: Math.max(0, 100 - (product.price / 10)) // Lower price is better
    };

    return Object.entries(comparisonWeights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight / 100);
    }, 0);
  };

  const runComparison = () => {
    const selectedData = sustainabilityData.filter(p => selectedProducts.includes(p.id));
    const results = selectedData.map(product => ({
      ...product,
      weightedScore: calculateWeightedScore(product),
      breakdown: {
        carbonFootprint: Math.max(0, 100 - product.carbonFootprint),
        recyclabilityScore: product.recyclabilityScore,
        energyEfficiency: product.energyEfficiency,
        localSourcing: product.localSourcing ? 100 : 0,
        certifications: Math.min(100, product.certifications.length * 20),
        price: Math.max(0, 100 - (product.price / 10))
      }
    })).sort((a, b) => b.weightedScore - a.weightedScore);

    setComparisonResults(results);
    setStep('results');
  };

  const resetWizard = () => {
    setStep('select');
    setSelectedProducts([]);
    setComparisonResults([]);
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6 text-green-600" />
          </motion.div>
          One-Click Sustainability Comparison Wizard
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Compare materials based on environmental impact and sustainability metrics
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {['select', 'weights', 'results'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: step === stepName ? '#10b981' : index < ['select', 'weights', 'results'].indexOf(step) ? '#10b981' : '#e5e7eb',
                  color: step === stepName || index < ['select', 'weights', 'results'].indexOf(step) ? '#ffffff' : '#6b7280'
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
              >
                {index + 1}
              </motion.div>
              <span className="ml-2 text-sm font-medium capitalize">{stepName}</span>
              {index < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Product Selection */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search products or brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="product-search"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Select 2-6 products to compare ({selectedProducts.length} selected)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProducts.includes(product.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (selectedProducts.includes(product.id)) {
                        setSelectedProducts(prev => prev.filter(id => id !== product.id));
                      } else if (selectedProducts.length < 6) {
                        setSelectedProducts(prev => [...prev, product.id]);
                      }
                    }}
                    data-testid={`product-card-${product.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{product.productName}</h3>
                        <p className="text-xs text-gray-600">{product.brand}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        readOnly
                        className="ml-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Sustainability Score:</span>
                        <span className={`text-xs font-bold ${getScoreColor(product.overallScore)}`}>
                          {product.overallScore}/100
                        </span>
                      </div>
                      <Progress value={product.overallScore} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Environmental Impact:</span>
                        <Badge className={`text-xs ${getImpactColor(product.environmentalImpact)}`}>
                          {product.environmentalImpact}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        ₹{product.price} • {product.certifications.length} certifications
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => setStep('weights')}
                  disabled={selectedProducts.length < 2}
                  className="px-8"
                  data-testid="proceed-to-weights"
                >
                  Configure Weights ({selectedProducts.length} products)
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Weight Configuration */}
          {step === 'weights' && (
            <motion.div
              key="weights"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Configure Comparison Weights</h3>
                <p className="text-gray-600">Adjust the importance of each sustainability factor</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sustainabilityCategories.map((category) => {
                  const Icon = category.icon;
                  const value = comparisonWeights[category.key as keyof ComparisonWeights];
                  
                  return (
                    <motion.div
                      key={category.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" style={{ color: category.color }} />
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                        <Badge variant="outline">{value}%</Badge>
                      </div>
                      
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => {
                          setComparisonWeights(prev => ({
                            ...prev,
                            [category.key]: newValue
                          }));
                        }}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full"
                        data-testid={`weight-slider-${category.key}`}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Price Weight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Price Consideration</h4>
                    <p className="text-xs text-gray-600">How much should cost factor into the decision</p>
                  </div>
                  <Badge variant="outline">{comparisonWeights.price}%</Badge>
                </div>
                
                <Slider
                  value={[comparisonWeights.price]}
                  onValueChange={([newValue]) => {
                    setComparisonWeights(prev => ({
                      ...prev,
                      price: newValue
                    }));
                  }}
                  max={30}
                  min={0}
                  step={5}
                  className="w-full"
                  data-testid="weight-slider-price"
                />
              </motion.div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Total Weight: {Object.values(comparisonWeights).reduce((sum, weight) => sum + weight, 0)}%
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => setStep('select')}>
                    Back to Selection
                  </Button>
                  <Button onClick={runComparison} className="px-8" data-testid="run-comparison">
                    Run Comparison
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Comparison Results */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Sustainability Comparison Results</h3>
                <p className="text-gray-600">Ranked by weighted sustainability score</p>
              </div>

              <div className="space-y-4">
                {comparisonResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 border rounded-lg ${
                      index === 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'
                    }`}
                    data-testid={`result-card-${index}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-green-600' : index === 1 ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{result.productName}</h4>
                          <p className="text-sm text-gray-600">{result.brand} • {result.category}</p>
                          <div className="flex gap-2 mt-1">
                            {result.certifications.map((cert: string) => (
                              <Badge key={cert} variant="secondary" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(result.weightedScore)}`}>
                          {result.weightedScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Weighted Score</div>
                        <div className="text-lg font-semibold text-gray-800 mt-1">
                          ₹{result.price}
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {sustainabilityCategories.map((category) => {
                        const score = result.breakdown[category.key as keyof typeof result.breakdown];
                        const weight = comparisonWeights[category.key as keyof ComparisonWeights];
                        const Icon = category.icon;
                        
                        return (
                          <div key={category.key} className="text-center">
                            <Icon className="h-4 w-4 mx-auto mb-1" style={{ color: category.color }} />
                            <div className="text-xs font-medium">{category.name}</div>
                            <div className={`text-sm font-bold ${getScoreColor(score)}`}>
                              {score.toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-500">({weight}% weight)</div>
                          </div>
                        );
                      })}
                    </div>

                    {index === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Recommended Choice - Best overall sustainability score
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setStep('weights')}>
                  Adjust Weights
                </Button>
                <Button variant="outline" onClick={resetWizard}>
                  New Comparison
                </Button>
                <Button onClick={() => window.print()} data-testid="export-results">
                  Export Results
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}