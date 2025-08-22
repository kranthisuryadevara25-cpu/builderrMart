import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, TrendingUp, TrendingDown, Eye, BarChart3, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeatMapData {
  id: string;
  materialType: string;
  region: string;
  state: string;
  city?: string;
  currentPrice: number;
  priceChange: number;
  marketDemand: 'low' | 'medium' | 'high';
  supplyStatus: 'shortage' | 'adequate' | 'surplus';
  priceVolatility: number;
  competitorCount: number;
  coordinates?: { lat: number; lng: number };
}

const materialTypes = [
  { value: 'cement', label: 'Cement', icon: '🏗️', color: '#94a3b8' },
  { value: 'steel', label: 'Steel', icon: '⚡', color: '#64748b' },
  { value: 'bricks', label: 'Bricks', icon: '🧱', color: '#dc2626' },
  { value: 'sand', label: 'Sand', icon: '🏖️', color: '#fbbf24' },
  { value: 'aggregate', label: 'Aggregate', icon: '🪨', color: '#6b7280' },
];

const regions = [
  'North India', 'South India', 'East India', 'West India', 'Central India', 'Northeast India'
];

const states = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'
];

// Mock data for demonstration
const generateMockHeatMapData = (materialType: string): HeatMapData[] => {
  return states.map((state, index) => ({
    id: `${materialType}-${state}-${index}`,
    materialType,
    region: regions[index % regions.length],
    state,
    city: state,
    currentPrice: Math.floor(Math.random() * 1000) + 300,
    priceChange: (Math.random() - 0.5) * 20,
    marketDemand: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    supplyStatus: ['shortage', 'adequate', 'surplus'][Math.floor(Math.random() * 3)] as 'shortage' | 'adequate' | 'surplus',
    priceVolatility: Math.random() * 15,
    competitorCount: Math.floor(Math.random() * 20) + 5,
    coordinates: { lat: 28.6139 + (Math.random() - 0.5) * 10, lng: 77.2090 + (Math.random() - 0.5) * 10 }
  }));
};

export default function InteractivePriceHeatMap() {
  const [selectedMaterial, setSelectedMaterial] = useState('cement');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([]);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Fetch real products from API
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      // Generate dynamic data based on real products
      const materialProducts = (products as any[]).filter((p: any) => 
        p.name?.toLowerCase().includes(selectedMaterial.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(selectedMaterial.toLowerCase())
      );
      
      const dynamicData = states.map((state, index) => {
        const baseProduct = materialProducts[index % materialProducts.length];
        const basePrice = baseProduct ? parseFloat(baseProduct.basePrice) : Math.floor(Math.random() * 1000) + 300;
        const regionalMultiplier = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2 multiplier
        
        return {
          id: `${selectedMaterial}-${state}-${index}`,
          materialType: selectedMaterial,
          region: regions[index % regions.length],
          state,
          city: state,
          currentPrice: Math.floor(basePrice * regionalMultiplier),
          priceChange: (Math.random() - 0.5) * 20,
          marketDemand: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          supplyStatus: ['shortage', 'adequate', 'surplus'][Math.floor(Math.random() * 3)] as 'shortage' | 'adequate' | 'surplus',
          priceVolatility: Math.random() * 15,
          competitorCount: Math.floor(Math.random() * 20) + 5,
          coordinates: { lat: 28.6139 + (Math.random() - 0.5) * 10, lng: 77.2090 + (Math.random() - 0.5) * 10 },
          productName: baseProduct?.name || `${selectedMaterial} Product`,
          productId: baseProduct?.id || `mock-${index}`
        };
      });
      
      setHeatMapData(dynamicData);
    } else {
      // Fallback to mock data if no products available
      const data = generateMockHeatMapData(selectedMaterial);
      setHeatMapData(data);
    }
    setAnimationKey(prev => prev + 1);
  }, [selectedMaterial, selectedRegion, products]);

  // Real-time price updates simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (realTimeMode) {
      interval = setInterval(() => {
        setHeatMapData(prev => prev.map(item => ({
          ...item,
          currentPrice: item.currentPrice + (Math.random() - 0.5) * 10,
          priceChange: item.priceChange + (Math.random() - 0.5) * 5,
          priceVolatility: Math.random() * 15
        })));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [realTimeMode]);

  const getHeatColor = (priceChange: number, volatility: number) => {
    const intensity = Math.abs(priceChange) + volatility;
    if (priceChange > 0) {
      // Rising prices - Red spectrum
      if (intensity > 15) return 'bg-red-600';
      if (intensity > 10) return 'bg-red-500';
      if (intensity > 5) return 'bg-red-400';
      return 'bg-red-300';
    } else {
      // Falling prices - Green spectrum
      if (intensity > 15) return 'bg-green-600';
      if (intensity > 10) return 'bg-green-500';
      if (intensity > 5) return 'bg-green-400';
      return 'bg-green-300';
    }
  };

  const getDemandIcon = (demand: string) => {
    switch (demand) {
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'medium': return <BarChart3 className="h-4 w-4 text-yellow-500" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getSupplyIcon = (supply: string) => {
    switch (supply) {
      case 'shortage': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'adequate': return <Eye className="h-4 w-4 text-green-500" />;
      case 'surplus': return <Zap className="h-4 w-4 text-blue-500" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const filteredData = selectedRegion === 'all' 
    ? heatMapData 
    : heatMapData.filter(item => item.region === selectedRegion);

  const selectedMaterialData = materialTypes.find(m => m.value === selectedMaterial);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">{selectedMaterialData?.icon}</span>
            <span>Interactive Material Price Heat Map</span>
          </motion.div>
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time price visualization across different regions with market insights
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Material:</label>
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
              <SelectTrigger className="w-40" data-testid="material-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map(material => (
                  <SelectItem key={material.value} value={material.value}>
                    <div className="flex items-center gap-2">
                      <span>{material.icon}</span>
                      {material.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Region:</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40" data-testid="region-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('grid')}
              data-testid="grid-view-button"
            >
              Grid View
            </Button>
            <Button 
              variant={viewMode === 'map' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('map')}
              data-testid="map-view-button"
            >
              Map View
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">Price Rising</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Price Falling</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span className="text-sm">High Demand</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm">Supply Shortage</span>
          </div>
        </div>

        {/* Heat Map Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredData.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05, 
                  transition: { duration: 0.2 }
                }}
                className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 ${getHeatColor(location.priceChange, location.priceVolatility)} text-white`}
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                data-testid={`location-card-${location.state}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {location.city || location.state}
                    </h3>
                    <p className="text-sm opacity-90">{location.region}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    ₹{location.currentPrice}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Price Change:</span>
                    <div className="flex items-center gap-1">
                      {location.priceChange > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="text-sm font-medium">
                        {location.priceChange > 0 ? '+' : ''}{location.priceChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Demand:</span>
                    <div className="flex items-center gap-1">
                      {getDemandIcon(location.marketDemand)}
                      <span className="text-sm capitalize">{location.marketDemand}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Supply:</span>
                    <div className="flex items-center gap-1">
                      {getSupplyIcon(location.supplyStatus)}
                      <span className="text-sm capitalize">{location.supplyStatus}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Volatility:</span>
                    <span className="text-sm">{location.priceVolatility.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Hover Details */}
                <AnimatePresence>
                  {hoveredLocation === location.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-black bg-opacity-90 rounded-lg p-4 z-10"
                    >
                      <h4 className="font-semibold text-white mb-2">Market Insights</h4>
                      <div className="space-y-1 text-sm text-gray-200">
                        <p>Competitors: {location.competitorCount}</p>
                        <p>Market Position: {location.priceChange > 5 ? 'Bullish' : location.priceChange < -5 ? 'Bearish' : 'Stable'}</p>
                        <p>Recommendation: {location.supplyStatus === 'shortage' ? 'Buy Now' : location.priceChange < -3 ? 'Great Deal' : 'Monitor'}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Summary Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                ₹{filteredData.reduce((sum, item) => sum + item.currentPrice, 0) / filteredData.length || 0}
              </div>
              <div className="text-sm text-gray-600">Average Price</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(item => item.priceChange < 0).length}
              </div>
              <div className="text-sm text-gray-600">Falling Markets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredData.filter(item => item.supplyStatus === 'shortage').length}
              </div>
              <div className="text-sm text-gray-600">Supply Shortages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(filteredData.reduce((sum, item) => sum + item.priceVolatility, 0) / filteredData.length || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg. Volatility</div>
            </CardContent>
          </Card>
        </motion.div>
      </CardContent>
    </Card>
  );
}