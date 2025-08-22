import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart, Activity } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

interface PriceTrend {
  id: string;
  productId: string;
  price: number;
  marketCondition: 'stable' | 'rising' | 'falling' | 'volatile';
  region: string;
  recordDate: string;
  productName?: string;
}

interface TrendData {
  date: string;
  price: number;
  change: number;
  condition: string;
}

export default function MaterialTrendsVisualizer() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('national');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Fetch products for selection
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // Fetch price trends
  const { data: trends = [], isLoading } = useQuery({
    queryKey: ['/api/material-trends', selectedProduct, selectedRegion, timeRange],
    enabled: !!selectedProduct,
  });

  // Mock trend data for demonstration
  const mockTrendData: TrendData[] = [
    { date: '2024-01-01', price: 380, change: 2.5, condition: 'rising' },
    { date: '2024-01-15', price: 385, change: 1.3, condition: 'stable' },
    { date: '2024-02-01', price: 390, change: 1.3, condition: 'rising' },
    { date: '2024-02-15', price: 388, change: -0.5, condition: 'falling' },
    { date: '2024-03-01', price: 395, change: 1.8, condition: 'rising' },
    { date: '2024-03-15', price: 392, change: -0.8, condition: 'stable' },
    { date: '2024-04-01', price: 400, change: 2.0, condition: 'rising' },
  ];

  const trendData = trends.length > 0 ? trends : mockTrendData;

  const formatPrice = (value: number) => `₹${value.toLocaleString()}`;
  
  const getTrendIcon = (condition: string) => {
    switch (condition) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'volatile': return <Activity className="w-4 h-4 text-orange-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLatestTrend = () => {
    if (trendData.length === 0) return null;
    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    if (!previous) return null;
    
    const change = ((latest.price - previous.price) / previous.price) * 100;
    return {
      price: latest.price,
      change: change,
      condition: latest.condition
    };
  };

  const renderChart = () => {
    const chartProps = {
      width: 800,
      height: 400,
      data: trendData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Price']} />
            <Bar dataKey="price" fill="#3b82f6" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Price']} />
            <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        );
      default:
        return (
          <RechartsLineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={(value) => [formatPrice(Number(value)), 'Price']} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#1d4ed8' }}
            />
          </RechartsLineChart>
        );
    }
  };

  const latestTrend = getLatestTrend();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Material Price Trends Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Material</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {products.slice(0, 10).map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="north">North India</SelectItem>
                  <SelectItem value="south">South India</SelectItem>
                  <SelectItem value="west">West India</SelectItem>
                  <SelectItem value="east">East India</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 3 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Chart Type</label>
              <div className="flex gap-1">
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <LineChart className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  <Activity className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Price Status */}
      {latestTrend && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-2xl font-bold">{formatPrice(latestTrend.price)}</p>
                </div>
                {getTrendIcon(latestTrend.condition)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Price Change</p>
                  <p className={`text-2xl font-bold ${latestTrend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {latestTrend.change >= 0 ? '+' : ''}{latestTrend.change.toFixed(2)}%
                  </p>
                </div>
                {latestTrend.change >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Market Condition</p>
                  <p className="text-2xl font-bold capitalize">{latestTrend.condition}</p>
                </div>
                {getTrendIcon(latestTrend.condition)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Chart */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Price Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Price Predictions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Week:</span>
                  <span className="font-medium text-green-600">↗ +2.1% (₹398)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Month:</span>
                  <span className="font-medium text-blue-600">→ Stable (₹395-405)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Seasonal Trend:</span>
                  <span className="font-medium text-orange-600">↗ Rising (Summer demand)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Market Factors</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Strong construction activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Rising raw material costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Government infrastructure push</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Supply chain constraints</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}