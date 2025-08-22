import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  LineChart,
  Activity,
  MapPin,
  Truck,
  Factory,
  Zap,
  Target,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MaterialForecast {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  currentPrice: number;
  predictedPrices: PricePrediction[];
  availabilityForecast: AvailabilityForecast[];
  demandTrends: DemandTrend[];
  supplyChainAnalysis: SupplyChainAnalysis;
  seasonalPatterns: SeasonalPattern[];
  riskFactors: RiskFactor[];
  opportunities: MarketOpportunity[];
  confidence: number;
  lastUpdated: string;
}

interface PricePrediction {
  date: string;
  predictedPrice: number;
  confidence: number;
  factors: PriceFactor[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface AvailabilityForecast {
  date: string;
  availabilityScore: number; // 0-100
  stockLevel: 'critical' | 'low' | 'adequate' | 'high';
  leadTime: number; // days
  suppliers: {
    total: number;
    available: number;
    capacity: number;
  };
}

interface DemandTrend {
  period: string;
  demand: number;
  growth: number;
  drivers: string[];
  regionalVariation: RegionalDemand[];
}

interface RegionalDemand {
  region: string;
  demand: number;
  growth: number;
  marketShare: number;
}

interface SupplyChainAnalysis {
  bottlenecks: Bottleneck[];
  alternatives: Alternative[];
  logistics: LogisticsInsight[];
  sustainability: SustainabilityMetric[];
}

interface Bottleneck {
  id: string;
  type: 'production' | 'transportation' | 'storage' | 'regulatory';
  description: string;
  impact: 'low' | 'medium' | 'high';
  likelihood: number;
  mitigation: string;
  timeline: string;
}

interface Alternative {
  id: string;
  name: string;
  type: 'supplier' | 'material' | 'route';
  description: string;
  reliability: number;
  costImpact: number;
  qualityScore: number;
  implementationTime: number;
}

interface LogisticsInsight {
  route: string;
  avgDeliveryTime: number;
  reliability: number;
  cost: number;
  capacity: number;
  constraints: string[];
}

interface SustainabilityMetric {
  aspect: string;
  currentScore: number;
  trend: 'improving' | 'stable' | 'declining';
  impact: string;
}

interface PriceFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

interface SeasonalPattern {
  month: number;
  priceMultiplier: number;
  demandMultiplier: number;
  availabilityMultiplier: number;
  explanation: string;
}

interface RiskFactor {
  id: string;
  type: 'supply' | 'demand' | 'price' | 'regulatory' | 'environmental';
  title: string;
  description: string;
  probability: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  mitigation: string;
}

interface MarketOpportunity {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  timeframe: string;
  actionRequired: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function PredictiveMaterialForecast() {
  const [activeTab, setActiveTab] = useState('forecast');
  const [forecasts, setForecasts] = useState<MaterialForecast[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('mumbai');
  const [forecastPeriod, setForecastPeriod] = useState([90]);
  const [alertThreshold, setAlertThreshold] = useState([20]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real products for forecasting
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Generate forecast mutation
  const generateForecastMutation = useMutation({
    mutationFn: async (materialId: string) => {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing
      
      const forecast = generateMaterialForecast(materialId, products as any[]);
      return forecast;
    },
    onSuccess: (forecast) => {
      setForecasts(prev => {
        const existing = prev.find(f => f.materialId === forecast.materialId);
        if (existing) {
          return prev.map(f => f.materialId === forecast.materialId ? forecast : f);
        }
        return [...prev, forecast];
      });
      setSelectedMaterial(forecast.id);
      setIsGenerating(false);
      toast({
        title: "Forecast Generated! 📊",
        description: `Predictive analysis for ${forecast.materialName} is ready`,
      });
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  // Generate sample forecasts from real data
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const sampleForecasts = generateSampleForecasts(products as any[]);
      setForecasts(sampleForecasts);
      if (sampleForecasts.length > 0) {
        setSelectedMaterial(sampleForecasts[0].id);
      }
    }
  }, [products]);

  const generateSampleForecasts = (products: any[]): MaterialForecast[] => {
    return products.slice(0, 6).map((product, index) => 
      generateMaterialForecast(product.id, products, product)
    );
  };

  const generateMaterialForecast = (materialId: string, products: any[], baseProduct?: any): MaterialForecast => {
    const product = baseProduct || products.find(p => p.id === materialId) || products[0];
    const currentPrice = parseFloat(product.basePrice) || 500;
    
    // Generate price predictions for the next 90 days
    const predictedPrices: PricePrediction[] = Array.from({ length: 90 }, (_, i) => {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const seasonality = Math.sin((i / 365) * 2 * Math.PI) * 0.1; // Seasonal variation
      const trend = (Math.random() - 0.5) * 0.02; // Random trend
      const volatility = (Math.random() - 0.5) * 0.05; // Daily volatility
      
      const priceMultiplier = 1 + seasonality + trend + volatility;
      const predictedPrice = currentPrice * priceMultiplier;
      const confidence = Math.max(60, 95 - (i * 0.3)); // Decreasing confidence over time
      
      return {
        date: date.toISOString(),
        predictedPrice: Math.max(predictedPrice * 0.8, predictedPrice),
        confidence,
        factors: generatePriceFactors(),
        priceRange: {
          min: predictedPrice * 0.9,
          max: predictedPrice * 1.1
        }
      };
    });

    // Generate availability forecast
    const availabilityForecast: AvailabilityForecast[] = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const baseAvailability = 70 + Math.random() * 25;
      const seasonalImpact = Math.sin((i / 12) * 2 * Math.PI) * 10;
      const availabilityScore = Math.max(20, Math.min(100, baseAvailability + seasonalImpact));
      
      let stockLevel: 'critical' | 'low' | 'adequate' | 'high';
      if (availabilityScore < 30) stockLevel = 'critical';
      else if (availabilityScore < 50) stockLevel = 'low';
      else if (availabilityScore < 80) stockLevel = 'adequate';
      else stockLevel = 'high';

      return {
        date: date.toISOString(),
        availabilityScore,
        stockLevel,
        leadTime: Math.max(3, 14 - (availabilityScore / 10)),
        suppliers: {
          total: 15 + Math.floor(Math.random() * 10),
          available: Math.floor((availabilityScore / 100) * 20),
          capacity: Math.floor(availabilityScore * 1.2)
        }
      };
    });

    // Generate demand trends
    const demandTrends: DemandTrend[] = Array.from({ length: 12 }, (_, i) => {
      const period = new Date();
      period.setMonth(period.getMonth() + i);
      
      const baseDemand = 1000 + Math.random() * 500;
      const growth = (Math.random() - 0.5) * 20; // -10% to +10% growth
      
      return {
        period: period.toISOString(),
        demand: baseDemand,
        growth,
        drivers: generateDemandDrivers(),
        regionalVariation: generateRegionalDemand()
      };
    });

    return {
      id: `forecast-${product.id}`,
      materialId: product.id,
      materialName: product.name,
      category: product.categoryName || 'Construction Material',
      currentPrice,
      predictedPrices,
      availabilityForecast,
      demandTrends,
      supplyChainAnalysis: generateSupplyChainAnalysis(),
      seasonalPatterns: generateSeasonalPatterns(),
      riskFactors: generateRiskFactors(),
      opportunities: generateMarketOpportunities(currentPrice),
      confidence: 85 + Math.random() * 10,
      lastUpdated: new Date().toISOString()
    };
  };

  const generatePriceFactors = (): PriceFactor[] => {
    const factors = [
      { factor: 'Raw Material Costs', impact: 'negative' as const, weight: 0.3, description: 'Increased cost of steel and cement' },
      { factor: 'Transportation', impact: 'positive' as const, weight: 0.2, description: 'Improved logistics efficiency' },
      { factor: 'Demand Surge', impact: 'negative' as const, weight: 0.25, description: 'Infrastructure project boom' },
      { factor: 'Supply Chain', impact: 'neutral' as const, weight: 0.15, description: 'Stable supplier network' },
      { factor: 'Market Competition', impact: 'positive' as const, weight: 0.1, description: 'New suppliers entering market' }
    ];
    
    return factors.slice(0, 3 + Math.floor(Math.random() * 3));
  };

  const generateDemandDrivers = (): string[] => {
    const drivers = [
      'Infrastructure development projects',
      'Residential construction growth',
      'Commercial real estate expansion',
      'Government policy changes',
      'Seasonal construction patterns',
      'Economic growth indicators'
    ];
    
    return drivers.slice(0, 2 + Math.floor(Math.random() * 3));
  };

  const generateRegionalDemand = (): RegionalDemand[] => {
    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];
    
    return regions.map(region => ({
      region,
      demand: 500 + Math.random() * 1000,
      growth: (Math.random() - 0.5) * 30,
      marketShare: 10 + Math.random() * 20
    }));
  };

  const generateSupplyChainAnalysis = (): SupplyChainAnalysis => {
    return {
      bottlenecks: [
        {
          id: 'bottleneck-1',
          type: 'transportation',
          description: 'Port congestion affecting material imports',
          impact: 'medium',
          likelihood: 65,
          mitigation: 'Alternative port routes and advance booking',
          timeline: 'Next 30 days'
        },
        {
          id: 'bottleneck-2',
          type: 'production',
          description: 'Seasonal maintenance shutdowns',
          impact: 'high',
          likelihood: 90,
          mitigation: 'Advance procurement and inventory buildup',
          timeline: 'Q2 2024'
        }
      ],
      alternatives: [
        {
          id: 'alt-1',
          name: 'Regional Supplier Network',
          type: 'supplier',
          description: 'Network of 5 regional suppliers for diversification',
          reliability: 85,
          costImpact: 5,
          qualityScore: 90,
          implementationTime: 14
        },
        {
          id: 'alt-2',
          name: 'Alternative Material Grade',
          type: 'material',
          description: 'Lower grade material for non-critical applications',
          reliability: 95,
          costImpact: -15,
          qualityScore: 80,
          implementationTime: 7
        }
      ],
      logistics: [
        {
          route: 'Mumbai Port → Warehouse',
          avgDeliveryTime: 3,
          reliability: 92,
          cost: 150,
          capacity: 500,
          constraints: ['Weather dependent', 'Port capacity']
        },
        {
          route: 'Local Supplier → Direct',
          avgDeliveryTime: 1,
          reliability: 98,
          cost: 200,
          capacity: 200,
          constraints: ['Limited quantity', 'Premium pricing']
        }
      ],
      sustainability: [
        {
          aspect: 'Carbon Footprint',
          currentScore: 72,
          trend: 'improving',
          impact: 'Local sourcing reducing transportation emissions'
        },
        {
          aspect: 'Circular Economy',
          currentScore: 58,
          trend: 'stable',
          impact: 'Recycling programs in early stages'
        }
      ]
    };
  };

  const generateSeasonalPatterns = (): SeasonalPattern[] => {
    const patterns = [
      { month: 1, priceMultiplier: 1.1, demandMultiplier: 0.8, availabilityMultiplier: 1.2, explanation: 'Winter slowdown, lower demand' },
      { month: 2, priceMultiplier: 1.05, demandMultiplier: 0.9, availabilityMultiplier: 1.1, explanation: 'Pre-spring preparation' },
      { month: 3, priceMultiplier: 1.0, demandMultiplier: 1.2, availabilityMultiplier: 1.0, explanation: 'Construction season begins' },
      { month: 4, priceMultiplier: 0.95, demandMultiplier: 1.4, availabilityMultiplier: 0.9, explanation: 'Peak construction activity' },
      { month: 5, priceMultiplier: 0.9, demandMultiplier: 1.5, availabilityMultiplier: 0.8, explanation: 'High demand, supply constraints' },
      { month: 6, priceMultiplier: 1.0, demandMultiplier: 1.2, availabilityMultiplier: 0.7, explanation: 'Monsoon preparation' },
      { month: 7, priceMultiplier: 1.15, demandMultiplier: 0.6, availabilityMultiplier: 0.6, explanation: 'Monsoon disruptions' },
      { month: 8, priceMultiplier: 1.1, demandMultiplier: 0.7, availabilityMultiplier: 0.8, explanation: 'Continued monsoon impact' },
      { month: 9, priceMultiplier: 1.0, demandMultiplier: 1.1, availabilityMultiplier: 1.0, explanation: 'Post-monsoon recovery' },
      { month: 10, priceMultiplier: 0.95, demandMultiplier: 1.3, availabilityMultiplier: 1.1, explanation: 'Festival season construction' },
      { month: 11, priceMultiplier: 1.0, demandMultiplier: 1.2, availabilityMultiplier: 1.0, explanation: 'Year-end projects' },
      { month: 12, priceMultiplier: 1.05, demandMultiplier: 0.9, availabilityMultiplier: 1.1, explanation: 'Holiday slowdown' }
    ];
    
    return patterns;
  };

  const generateRiskFactors = (): RiskFactor[] => {
    return [
      {
        id: 'risk-1',
        type: 'supply',
        title: 'Supplier Consolidation Risk',
        description: 'Market dominated by few large suppliers, creating dependency risk',
        probability: 35,
        impact: 'high',
        timeframe: '6-12 months',
        mitigation: 'Diversify supplier base and develop backup sources'
      },
      {
        id: 'risk-2',
        type: 'regulatory',
        title: 'Environmental Regulations',
        description: 'New environmental standards may affect production processes',
        probability: 70,
        impact: 'medium',
        timeframe: '12-18 months',
        mitigation: 'Monitor regulatory changes and source compliant materials'
      },
      {
        id: 'risk-3',
        type: 'price',
        title: 'Commodity Price Volatility',
        description: 'Raw material prices showing high volatility due to global factors',
        probability: 80,
        impact: 'high',
        timeframe: '3-6 months',
        mitigation: 'Use price hedging instruments and flexible contracts'
      }
    ];
  };

  const generateMarketOpportunities = (currentPrice: number): MarketOpportunity[] => {
    return [
      {
        id: 'opp-1',
        title: 'Bulk Purchase Discount',
        description: 'Quarterly bulk orders can secure 8-12% discount from current suppliers',
        potentialSavings: currentPrice * 0.1,
        timeframe: 'Next 30 days',
        actionRequired: 'Negotiate annual contract with volume commitments',
        difficulty: 'easy'
      },
      {
        id: 'opp-2',
        title: 'Alternative Supplier Network',
        description: 'New suppliers entering market with competitive pricing',
        potentialSavings: currentPrice * 0.15,
        timeframe: '45-60 days',
        actionRequired: 'Evaluate and qualify new suppliers',
        difficulty: 'medium'
      },
      {
        id: 'opp-3',
        title: 'Direct Factory Sourcing',
        description: 'Bypass intermediaries for significant cost savings',
        potentialSavings: currentPrice * 0.2,
        timeframe: '3-6 months',
        actionRequired: 'Establish direct relationships with manufacturers',
        difficulty: 'hard'
      }
    ];
  };

  const generateForecast = (materialId: string) => {
    generateForecastMutation.mutate(materialId);
  };

  const selectedForecast = forecasts.find(f => f.id === selectedMaterial);

  return (
    <div className="w-full h-[700px] bg-white dark:bg-gray-900 rounded-lg border shadow-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecast" data-testid="tab-forecast">
            <LineChart className="h-4 w-4 mr-2" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="supply-chain" data-testid="tab-supply-chain">
            <Truck className="h-4 w-4 mr-2" />
            Supply Chain
          </TabsTrigger>
          <TabsTrigger value="risks" data-testid="tab-risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="opportunities" data-testid="tab-opportunities">
            <Target className="h-4 w-4 mr-2" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="h-[calc(100%-48px)] p-0">
          <div className="flex h-full">
            {/* Material Selection */}
            <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-800 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Generate Forecast
                  </h3>
                  <div className="space-y-3">
                    <Select onValueChange={generateForecast}>
                      <SelectTrigger data-testid="select-material">
                        <SelectValue placeholder="Select material to forecast" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(products) && (products as any[]).map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger data-testid="select-region">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                    <div>
                      <label className="text-sm font-medium">Forecast Period: {forecastPeriod[0]} days</label>
                      <Slider
                        value={forecastPeriod}
                        onValueChange={setForecastPeriod}
                        max={365}
                        min={30}
                        step={7}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {forecasts.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Your Forecasts</h3>
                    <div className="space-y-2">
                      {forecasts.map((forecast) => (
                        <motion.div
                          key={forecast.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedMaterial === forecast.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedMaterial(forecast.id)}
                          data-testid={`forecast-${forecast.id}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{forecast.materialName}</h4>
                            <Badge className={`text-xs ${
                              forecast.confidence > 85 ? 'bg-green-500' :
                              forecast.confidence > 70 ? 'bg-orange-500' : 'bg-red-500'
                            }`}>
                              {Math.round(forecast.confidence)}% confidence
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Current Price:</span>
                              <span className="font-medium">₹{forecast.currentPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>7-day Prediction:</span>
                              <span className={`font-medium ${
                                forecast.predictedPrices[6].predictedPrice > forecast.currentPrice ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ₹{forecast.predictedPrices[6].predictedPrice.toLocaleString()}
                                ({((forecast.predictedPrices[6].predictedPrice - forecast.currentPrice) / forecast.currentPrice * 100).toFixed(1)}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Availability:</span>
                              <span className={`font-medium ${
                                forecast.availabilityForecast[0].stockLevel === 'high' ? 'text-green-600' :
                                forecast.availabilityForecast[0].stockLevel === 'adequate' ? 'text-blue-600' :
                                forecast.availabilityForecast[0].stockLevel === 'low' ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                {forecast.availabilityForecast[0].stockLevel}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Updated: {new Date(forecast.lastUpdated).toLocaleString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Forecast Dashboard */}
            <div className="flex-1 p-4">
              {selectedForecast ? (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="text-sm text-gray-600">Price Trend (7d)</div>
                            <div className={`font-bold text-lg ${
                              selectedForecast.predictedPrices[6].predictedPrice > selectedForecast.currentPrice ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {selectedForecast.predictedPrices[6].predictedPrice > selectedForecast.currentPrice ? '+' : ''}
                              {((selectedForecast.predictedPrices[6].predictedPrice - selectedForecast.currentPrice) / selectedForecast.currentPrice * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-600">Availability</div>
                            <div className={`font-bold text-lg ${
                              selectedForecast.availabilityForecast[0].stockLevel === 'high' ? 'text-green-600' :
                              selectedForecast.availabilityForecast[0].stockLevel === 'adequate' ? 'text-blue-600' :
                              selectedForecast.availabilityForecast[0].stockLevel === 'low' ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {selectedForecast.availabilityForecast[0].availabilityScore}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <div>
                            <div className="text-sm text-gray-600">Lead Time</div>
                            <div className="font-bold text-lg">{Math.round(selectedForecast.availabilityForecast[0].leadTime)} days</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="text-sm text-gray-600">Confidence</div>
                            <div className="font-bold text-lg">{Math.round(selectedForecast.confidence)}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Price Forecast Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Price Forecast - Next {forecastPeriod[0]} Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-lg font-bold">₹{selectedForecast.currentPrice.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Current Price</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              ₹{selectedForecast.predictedPrices[forecastPeriod[0] - 1]?.predictedPrice.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Predicted Price ({forecastPeriod[0]}d)</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              ±₹{Math.round((selectedForecast.predictedPrices[forecastPeriod[0] - 1]?.priceRange.max - selectedForecast.predictedPrices[forecastPeriod[0] - 1]?.priceRange.min) / 2)}
                            </div>
                            <div className="text-sm text-gray-600">Price Range</div>
                          </div>
                        </div>

                        {/* Key Price Factors */}
                        <div>
                          <h4 className="font-medium mb-2">Key Price Factors</h4>
                          <div className="space-y-2">
                            {selectedForecast.predictedPrices[7].factors.map((factor, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{factor.factor}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${
                                    factor.impact === 'positive' ? 'bg-green-500' :
                                    factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                                  }`}>
                                    {factor.impact}
                                  </Badge>
                                  <span className="text-xs font-medium">{Math.round(factor.weight * 100)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Availability Forecast */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Availability Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {selectedForecast.availabilityForecast.slice(0, 4).map((forecast, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-sm">
                                {new Date(forecast.date).toLocaleDateString()}
                              </h4>
                              <Badge className={`text-xs ${
                                forecast.stockLevel === 'high' ? 'bg-green-500' :
                                forecast.stockLevel === 'adequate' ? 'bg-blue-500' :
                                forecast.stockLevel === 'low' ? 'bg-orange-500' : 'bg-red-500'
                              }`}>
                                {forecast.stockLevel}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Availability:</span>
                                <span className="font-medium">{forecast.availabilityScore}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lead Time:</span>
                                <span className="font-medium">{Math.round(forecast.leadTime)} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Suppliers:</span>
                                <span className="font-medium">{forecast.suppliers.available}/{forecast.suppliers.total}</span>
                              </div>
                            </div>
                            <Progress value={forecast.availabilityScore} className="h-2 mt-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Generate Predictive Forecast</h3>
                    <p>Select a material to generate AI-powered availability and pricing predictions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="supply-chain" className="h-[calc(100%-48px)] p-4">
          {selectedForecast ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Supply Chain Bottlenecks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedForecast.supplyChainAnalysis.bottlenecks.map((bottleneck) => (
                      <div key={bottleneck.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={`text-xs ${
                            bottleneck.impact === 'high' ? 'bg-red-500' :
                            bottleneck.impact === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}>
                            {bottleneck.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {bottleneck.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{bottleneck.description}</p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Likelihood:</span>
                            <span className="font-medium">{bottleneck.likelihood}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timeline:</span>
                            <span className="font-medium">{bottleneck.timeline}</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">{bottleneck.mitigation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Alternative Solutions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedForecast.supplyChainAnalysis.alternatives.map((alternative) => (
                      <div key={alternative.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{alternative.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {alternative.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alternative.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Reliability:</span>
                            <span className="font-medium ml-2">{alternative.reliability}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cost Impact:</span>
                            <span className={`font-medium ml-2 ${alternative.costImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {alternative.costImpact > 0 ? '+' : ''}{alternative.costImpact}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quality:</span>
                            <span className="font-medium ml-2">{alternative.qualityScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Setup Time:</span>
                            <span className="font-medium ml-2">{alternative.implementationTime} days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-500" />
                    Logistics Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedForecast.supplyChainAnalysis.logistics.map((route, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">{route.route}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Delivery Time:</span>
                            <span className="font-medium ml-2">{route.avgDeliveryTime} days</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Reliability:</span>
                            <span className="font-medium ml-2">{route.reliability}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-medium ml-2">₹{route.cost}/unit</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Capacity:</span>
                            <span className="font-medium ml-2">{route.capacity} units</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Constraints:</span>
                            <span className="font-medium ml-2">{route.constraints.length} factors</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {route.constraints.map(constraint => (
                              <Badge key={constraint} variant="outline" className="text-xs">
                                {constraint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a forecast to view supply chain analysis
            </div>
          )}
        </TabsContent>

        <TabsContent value="risks" className="h-[calc(100%-48px)] p-4">
          {selectedForecast ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="text-sm text-gray-600">High Risk Factors</div>
                        <div className="font-bold text-lg text-red-600">
                          {selectedForecast.riskFactors.filter(r => r.impact === 'high').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-sm text-gray-600">Immediate Risks</div>
                        <div className="font-bold text-lg text-orange-600">
                          {selectedForecast.riskFactors.filter(r => r.timeframe.includes('3-6') || r.timeframe.includes('Next')).length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-600">Avg Probability</div>
                        <div className="font-bold text-lg">
                          {Math.round(selectedForecast.riskFactors.reduce((sum, r) => sum + r.probability, 0) / selectedForecast.riskFactors.length)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Matrix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedForecast.riskFactors.map((risk) => (
                    <motion.div
                      key={risk.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            risk.impact === 'high' ? 'bg-red-500' :
                            risk.impact === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}>
                            {risk.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {risk.type} risk
                          </Badge>
                          <Badge className={`text-xs ${
                            risk.probability > 70 ? 'bg-red-500' :
                            risk.probability > 40 ? 'bg-orange-500' : 'bg-green-500'
                          }`}>
                            {risk.probability}% likely
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{risk.timeframe}</div>
                          <div className="text-xs text-gray-600">Timeline</div>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{risk.title}</h4>
                      <p className="text-sm text-gray-700 mb-3">{risk.description}</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Mitigation Strategy:</h5>
                        <p className="text-xs text-blue-700 dark:text-blue-300">{risk.mitigation}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a forecast to view risk analysis
            </div>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="h-[calc(100%-48px)] p-4">
          {selectedForecast ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Total Savings Potential</div>
                        <div className="font-bold text-lg text-green-600">
                          ₹{(selectedForecast.opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0) / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-600">Quick Wins</div>
                        <div className="font-bold text-lg">
                          {selectedForecast.opportunities.filter(opp => opp.difficulty === 'easy').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-gray-600">Immediate Actions</div>
                        <div className="font-bold text-lg">
                          {selectedForecast.opportunities.filter(opp => opp.timeframe.includes('30 days')).length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Market Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedForecast.opportunities.map((opportunity) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            opportunity.difficulty === 'easy' ? 'bg-green-500' :
                            opportunity.difficulty === 'medium' ? 'bg-orange-500' : 'bg-red-500'
                          }`}>
                            {opportunity.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {opportunity.timeframe}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">₹{(opportunity.potentialSavings / 100000).toFixed(1)}L</div>
                          <div className="text-xs text-gray-600">potential savings</div>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{opportunity.title}</h4>
                      <p className="text-sm text-gray-700 mb-3">{opportunity.description}</p>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Action Required:</h5>
                        <p className="text-xs text-green-700 dark:text-green-300">{opportunity.actionRequired}</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3" data-testid={`pursue-${opportunity.id}`}>
                        Pursue Opportunity
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a forecast to view market opportunities
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="h-[calc(100%-48px)] p-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Price Change Alert Threshold: {alertThreshold[0]}%</label>
                    <Slider
                      value={alertThreshold}
                      onValueChange={setAlertThreshold}
                      max={50}
                      min={5}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      Alert when predicted price changes exceed {alertThreshold[0]}%
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Alert Types</h4>
                      <div className="space-y-1">
                        {[
                          'Price increase alerts',
                          'Supply shortage warnings',
                          'Opportunity notifications',
                          'Risk factor updates'
                        ].map(alertType => (
                          <label key={alertType} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" defaultChecked className="rounded" />
                            {alertType}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Notification Methods</h4>
                      <div className="space-y-1">
                        {[
                          'Email notifications',
                          'SMS alerts',
                          'In-app notifications',
                          'Weekly reports'
                        ].map(method => (
                          <label key={method} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" defaultChecked className="rounded" />
                            {method}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: 'price',
                      title: 'Steel Price Surge Expected',
                      description: 'Predicted 15% price increase in next 14 days due to supply constraints',
                      severity: 'high',
                      time: '2 hours ago'
                    },
                    {
                      type: 'supply',
                      title: 'Cement Availability Declining',
                      description: 'Stock levels dropping to 35% in Mumbai region',
                      severity: 'medium',
                      time: '6 hours ago'
                    },
                    {
                      type: 'opportunity',
                      title: 'Bulk Purchase Discount Available',
                      description: 'Limited time 12% discount for orders above ₹5L',
                      severity: 'low',
                      time: '1 day ago'
                    }
                  ].map((alert, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            alert.severity === 'high' ? 'bg-red-500' :
                            alert.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-600">{alert.time}</span>
                      </div>
                      <h4 className="font-medium mb-1">{alert.title}</h4>
                      <p className="text-sm text-gray-700">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}