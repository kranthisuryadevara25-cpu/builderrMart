import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock, 
  Award, 
  Users, 
  Package, 
  Heart,
  Target,
  Zap,
  Trophy,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface VendorPerformance {
  id: string;
  vendorId: string;
  vendorName: string;
  totalSales: number;
  averageRating: number;
  totalOrders: number;
  onTimeDeliveries: number;
  totalDeliveries: number;
  customerSatisfactionScore: number;
  responsiveTime: number;
  qualityScore: number;
  performanceGrade: string;
  improvementAreas: string[];
  strengths: string[];
  monthlyPerformance: Array<{
    month: string;
    sales: number;
    orders: number;
    rating: number;
    satisfaction: number;
  }>;
}

interface StoryInsight {
  type: 'success' | 'challenge' | 'opportunity' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

const performanceGrades = [
  { grade: 'A+', color: '#10b981', range: '95-100%', description: 'Exceptional Performance' },
  { grade: 'A', color: '#059669', range: '90-94%', description: 'Outstanding Performance' },
  { grade: 'B+', color: '#3b82f6', range: '85-89%', description: 'Very Good Performance' },
  { grade: 'B', color: '#6366f1', range: '80-84%', description: 'Good Performance' },
  { grade: 'C+', color: '#f59e0b', range: '75-79%', description: 'Average Performance' },
  { grade: 'C', color: '#ef4444', range: '70-74%', description: 'Below Average' },
  { grade: 'D', color: '#dc2626', range: '< 70%', description: 'Needs Improvement' }
];

// Mock vendor performance data
const generateMockVendorData = (): VendorPerformance[] => {
  const vendorNames = [
    'BuildMaster Pro', 'SteelWorks Elite', 'CementCraft Solutions', 'EcoMaterials Ltd',
    'QuickBuild Supplies', 'Premium Construction Co', 'GreenBuild Materials', 'TechConstruct'
  ];

  return vendorNames.map((name, index) => {
    const performance = 70 + Math.random() * 25;
    const deliveryRate = 80 + Math.random() * 20;
    
    return {
      id: `vendor-${index}`,
      vendorId: `vendor-id-${index}`,
      vendorName: name,
      totalSales: Math.floor(Math.random() * 5000000) + 1000000,
      averageRating: 3.5 + Math.random() * 1.5,
      totalOrders: Math.floor(Math.random() * 1000) + 100,
      onTimeDeliveries: Math.floor(deliveryRate),
      totalDeliveries: 100,
      customerSatisfactionScore: performance,
      responsiveTime: Math.random() * 24 + 1,
      qualityScore: performance + Math.random() * 10 - 5,
      performanceGrade: performance > 95 ? 'A+' : performance > 90 ? 'A' : performance > 85 ? 'B+' : performance > 80 ? 'B' : performance > 75 ? 'C+' : 'C',
      improvementAreas: [
        'Delivery Speed', 'Customer Communication', 'Product Quality', 'Pricing Competitiveness'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      strengths: [
        'Reliable Delivery', 'Quality Products', 'Competitive Pricing', 'Excellent Support', 'Innovation'
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      monthlyPerformance: Array.from({ length: 6 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
        sales: Math.floor(Math.random() * 500000) + 200000,
        orders: Math.floor(Math.random() * 100) + 20,
        rating: 3.5 + Math.random() * 1.5,
        satisfaction: 70 + Math.random() * 25
      }))
    };
  });
};

const generateStoryInsights = (vendor: VendorPerformance): StoryInsight[] => {
  const insights: StoryInsight[] = [];

  // Performance Analysis
  if (vendor.performanceGrade === 'A+' || vendor.performanceGrade === 'A') {
    insights.push({
      type: 'success',
      title: '🌟 Star Performer Alert!',
      description: `${vendor.vendorName} is crushing it with a ${vendor.performanceGrade} grade and ${vendor.customerSatisfactionScore.toFixed(1)}% customer satisfaction. They're the vendor everyone wants to work with!`,
      impact: 'high',
      actionable: true,
      recommendation: 'Consider offering them preferential terms or higher volume commitments to maintain this relationship.'
    });
  }

  // Delivery Performance
  const deliveryRate = (vendor.onTimeDeliveries / vendor.totalDeliveries) * 100;
  if (deliveryRate > 95) {
    insights.push({
      type: 'success',
      title: '⚡ Lightning Fast Delivery Champion',
      description: `With ${deliveryRate.toFixed(1)}% on-time delivery, ${vendor.vendorName} is redefining speed and reliability. Their customers never have to worry about delays!`,
      impact: 'high',
      actionable: false
    });
  } else if (deliveryRate < 80) {
    insights.push({
      type: 'challenge',
      title: '🚨 Delivery Speed Bump Ahead',
      description: `${vendor.vendorName}'s on-time delivery rate of ${deliveryRate.toFixed(1)}% needs attention. This could be impacting customer projects and satisfaction.`,
      impact: 'high',
      actionable: true,
      recommendation: 'Schedule a meeting to discuss logistics optimization and delivery process improvements.'
    });
  }

  // Growth Trends
  const recentSales = vendor.monthlyPerformance.slice(-3).reduce((sum, month) => sum + month.sales, 0);
  const earlierSales = vendor.monthlyPerformance.slice(0, 3).reduce((sum, month) => sum + month.sales, 0);
  const growthRate = ((recentSales - earlierSales) / earlierSales) * 100;

  if (growthRate > 20) {
    insights.push({
      type: 'trend',
      title: '📈 Rocket Ship Growth Trajectory',
      description: `${vendor.vendorName} is on fire! Sales have grown ${growthRate.toFixed(1)}% over the last quarter. This upward momentum is impressive and worth celebrating.`,
      impact: 'medium',
      actionable: true,
      recommendation: 'Explore opportunities to expand product lines or increase order volumes with this growing partner.'
    });
  } else if (growthRate < -10) {
    insights.push({
      type: 'challenge',
      title: '📉 Concerning Downward Trend',
      description: `${vendor.vendorName}'s sales have declined ${Math.abs(growthRate).toFixed(1)}% recently. This trend needs investigation to understand the root causes.`,
      impact: 'high',
      actionable: true,
      recommendation: 'Conduct a partnership review to identify challenges and develop a recovery plan together.'
    });
  }

  // Response Time Analysis
  if (vendor.responsiveTime < 2) {
    insights.push({
      type: 'success',
      title: '💬 Communication Superstar',
      description: `${vendor.vendorName} responds in just ${vendor.responsiveTime.toFixed(1)} hours on average. Their quick communication keeps projects moving smoothly.`,
      impact: 'medium',
      actionable: false
    });
  } else if (vendor.responsiveTime > 12) {
    insights.push({
      type: 'opportunity',
      title: '⏰ Communication Speed Opportunity',
      description: `With a ${vendor.responsiveTime.toFixed(1)}-hour average response time, ${vendor.vendorName} could benefit from improved communication protocols.`,
      impact: 'medium',
      actionable: true,
      recommendation: 'Discuss implementing dedicated account management or faster communication channels.'
    });
  }

  return insights.slice(0, 4); // Limit to 4 insights
};

export default function VendorPerformanceStorytellingDashboard() {
  const [vendorData, setVendorData] = useState<VendorPerformance[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'individual' | 'comparison'>('overview');
  const [storyInsights, setStoryInsights] = useState<StoryInsight[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const data = generateMockVendorData();
    setVendorData(data);
  }, []);

  useEffect(() => {
    if (selectedVendor !== 'all') {
      const vendor = vendorData.find(v => v.id === selectedVendor);
      if (vendor) {
        setStoryInsights(generateStoryInsights(vendor));
        setAnimationKey(prev => prev + 1);
      }
    }
  }, [selectedVendor, vendorData]);

  const selectedVendorData = vendorData.find(v => v.id === selectedVendor);
  const topVendors = [...vendorData].sort((a, b) => b.customerSatisfactionScore - a.customerSatisfactionScore).slice(0, 3);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <Trophy className="h-5 w-5 text-green-600" />;
      case 'challenge': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'opportunity': return <Target className="h-5 w-5 text-blue-600" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 dark:bg-green-900/20';
      case 'challenge': return 'bg-red-50 border-red-200 dark:bg-red-900/20';
      case 'opportunity': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20';
      case 'trend': return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeInfo = performanceGrades.find(g => g.grade === grade);
    return gradeInfo?.color || '#6b7280';
  };

  const radarData = selectedVendorData ? [
    { subject: 'Quality', score: selectedVendorData.qualityScore, fullMark: 100 },
    { subject: 'Delivery', score: (selectedVendorData.onTimeDeliveries / selectedVendorData.totalDeliveries) * 100, fullMark: 100 },
    { subject: 'Communication', score: Math.max(0, 100 - (selectedVendorData.responsiveTime * 4)), fullMark: 100 },
    { subject: 'Customer Sat.', score: selectedVendorData.customerSatisfactionScore, fullMark: 100 },
    { subject: 'Value', score: selectedVendorData.averageRating * 20, fullMark: 100 }
  ] : [];

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
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Vendor Performance Storytelling Dashboard</span>
          </motion.div>
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Discover the stories behind vendor performance with AI-powered insights and analytics
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View Mode:</label>
            <div className="flex gap-2">
              {['overview', 'individual', 'comparison'].map(mode => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(mode as any)}
                  className="capitalize"
                  data-testid={`view-mode-${mode}`}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          {viewMode === 'individual' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Vendor:</label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="w-64" data-testid="vendor-selector">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendorData.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.vendorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Mode */}
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">🏆 Top Performing Vendors</h3>
                <p className="text-gray-600">Our vendor all-stars leading the marketplace</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topVendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`p-6 border-2 rounded-lg relative overflow-hidden ${
                      index === 0 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' :
                      index === 1 ? 'border-gray-400 bg-gray-50 dark:bg-gray-800' :
                      'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    }`}
                    data-testid={`top-vendor-${index}`}
                  >
                    <div className="absolute top-2 right-2">
                      {index === 0 && <Trophy className="h-6 w-6 text-yellow-600" />}
                      {index === 1 && <Award className="h-6 w-6 text-gray-600" />}
                      {index === 2 && <Star className="h-6 w-6 text-orange-600" />}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-lg">{vendor.vendorName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge style={{ backgroundColor: getGradeColor(vendor.performanceGrade), color: 'white' }}>
                          Grade {vendor.performanceGrade}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{vendor.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Customer Satisfaction:</span>
                        <span className="font-bold">{vendor.customerSatisfactionScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={vendor.customerSatisfactionScore} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">On-Time Delivery:</span>
                        <span className="font-bold">{((vendor.onTimeDeliveries / vendor.totalDeliveries) * 100).toFixed(1)}%</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        ₹{(vendor.totalSales / 1000000).toFixed(1)}M sales • {vendor.totalOrders} orders
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-medium mb-1">Top Strengths:</div>
                      <div className="flex flex-wrap gap-1">
                        {vendor.strengths.slice(0, 2).map(strength => (
                          <Badge key={strength} variant="secondary" className="text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Overall Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Marketplace Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {vendorData.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Vendors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {(vendorData.reduce((sum, v) => sum + v.customerSatisfactionScore, 0) / vendorData.length).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg. Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        ₹{(vendorData.reduce((sum, v) => sum + v.totalSales, 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {vendorData.filter(v => v.performanceGrade === 'A+' || v.performanceGrade === 'A').length}
                      </div>
                      <div className="text-sm text-gray-600">A-Grade Vendors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Individual Vendor Mode */}
          {viewMode === 'individual' && selectedVendorData && (
            <motion.div
              key={`individual-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Vendor Header */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{selectedVendorData.vendorName}</h3>
                      <p className="text-gray-600">Performance Story & Analytics</p>
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-4xl font-bold"
                        style={{ color: getGradeColor(selectedVendorData.performanceGrade) }}
                      >
                        {selectedVendorData.performanceGrade}
                      </div>
                      <div className="text-sm text-gray-600">Performance Grade</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedVendorData.customerSatisfactionScore.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Customer Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{(selectedVendorData.totalSales / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedVendorData.totalOrders}
                      </div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedVendorData.responsiveTime.toFixed(1)}h
                      </div>
                      <div className="text-sm text-gray-600">Avg. Response Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Story Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Performance Story Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {storyInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}
                      data-testid={`story-insight-${index}`}
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {insight.description}
                          </p>
                          {insight.recommendation && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                              <strong>💡 Recommendation:</strong> {insight.recommendation}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {insight.impact} impact
                            </Badge>
                            {insight.actionable && (
                              <Badge variant="outline" className="text-xs">
                                Actionable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Radar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="score"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={selectedVendorData.monthlyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="satisfaction" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Satisfaction %"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rating" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Rating"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths and Improvement Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedVendorData.strengths.map((strength, index) => (
                        <motion.div
                          key={strength}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{strength}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Target className="h-5 w-5" />
                      Improvement Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedVendorData.improvementAreas.map((area, index) => (
                        <motion.div
                          key={area}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                        >
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">{area}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Comparison Mode */}
          {viewMode === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">📊 Vendor Performance Comparison</h3>
                <p className="text-gray-600">Side-by-side analysis of all vendors</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Comparison Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={vendorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="vendorName" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="customerSatisfactionScore" fill="#10b981" name="Satisfaction %" />
                      <Bar dataKey="qualityScore" fill="#3b82f6" name="Quality Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Vendor</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Grade</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Satisfaction</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">On-Time Delivery</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Response Time</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorData.map((vendor, index) => (
                      <motion.tr
                        key={vendor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        data-testid={`comparison-row-${index}`}
                      >
                        <td className="border border-gray-300 dark:border-gray-600 p-3 font-medium">
                          {vendor.vendorName}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                          <Badge style={{ backgroundColor: getGradeColor(vendor.performanceGrade), color: 'white' }}>
                            {vendor.performanceGrade}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                          {vendor.customerSatisfactionScore.toFixed(1)}%
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                          {((vendor.onTimeDeliveries / vendor.totalDeliveries) * 100).toFixed(1)}%
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                          {vendor.responsiveTime.toFixed(1)}h
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-3 text-center">
                          ₹{(vendor.totalSales / 1000000).toFixed(1)}M
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}