import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  ShoppingCart, 
  Eye, 
  Heart, 
  Phone, 
  Mail, 
  Star,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  Users,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'completed' | 'current' | 'upcoming';
  progress: number;
  timeSpent: string;
  actions: string[];
  insights: string[];
  nextRecommendations: string[];
}

interface CustomerJourney {
  id: string;
  customerName: string;
  startDate: string;
  currentStage: string;
  overallProgress: number;
  totalValue: number;
  stages: JourneyStage[];
  touchpoints: TouchPoint[];
  conversionRate: number;
  engagementScore: number;
}

interface TouchPoint {
  id: string;
  type: 'website' | 'email' | 'phone' | 'store' | 'social';
  timestamp: string;
  action: string;
  outcome: 'positive' | 'neutral' | 'negative';
  value: number;
}

const defaultJourneyStages: JourneyStage[] = [
  {
    id: 'awareness',
    name: 'Awareness',
    description: 'Customer discovers BuildMart for construction needs',
    icon: Eye,
    status: 'completed',
    progress: 100,
    timeSpent: '2 days',
    actions: ['Website visit', 'Social media interaction', 'Search results'],
    insights: ['High interest in cement products', 'Price-conscious buyer'],
    nextRecommendations: ['Send product catalog', 'Offer price comparison']
  },
  {
    id: 'consideration',
    name: 'Consideration',
    description: 'Customer evaluates products and compares options',
    icon: BarChart3,
    status: 'completed',
    progress: 85,
    timeSpent: '5 days',
    actions: ['Product comparison', 'Price analysis', 'Vendor chat'],
    insights: ['Focused on quality and sustainability', 'Bulk purchase potential'],
    nextRecommendations: ['Schedule site visit', 'Provide samples']
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    description: 'Customer negotiates prices and terms',
    icon: Target,
    status: 'current',
    progress: 60,
    timeSpent: '3 days',
    actions: ['Price negotiation', 'Terms discussion', 'Quote requests'],
    insights: ['Seeking 15% discount', 'Prefers long-term contracts'],
    nextRecommendations: ['Offer volume discount', 'Present financing options']
  },
  {
    id: 'purchase',
    name: 'Purchase',
    description: 'Customer makes the purchase decision',
    icon: ShoppingCart,
    status: 'upcoming',
    progress: 0,
    timeSpent: '-',
    actions: [],
    insights: [],
    nextRecommendations: ['Follow up within 24h', 'Provide purchase incentives']
  },
  {
    id: 'delivery',
    name: 'Delivery',
    description: 'Order fulfillment and delivery',
    icon: MapPin,
    status: 'upcoming',
    progress: 0,
    timeSpent: '-',
    actions: [],
    insights: [],
    nextRecommendations: ['Schedule delivery', 'Ensure quality control']
  },
  {
    id: 'loyalty',
    name: 'Loyalty',
    description: 'Post-purchase relationship building',
    icon: Heart,
    status: 'upcoming',
    progress: 0,
    timeSpent: '-',
    actions: [],
    insights: [],
    nextRecommendations: ['Send satisfaction survey', 'Offer loyalty program']
  }
];

export default function InteractiveCustomerJourney() {
  const [selectedJourney, setSelectedJourney] = useState<string>('journey-1');
  const [viewMode, setViewMode] = useState<'timeline' | 'funnel' | 'analytics'>('timeline');
  const [customerJourneys, setCustomerJourneys] = useState<CustomerJourney[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Fetch real data
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
  });

  useEffect(() => {
    if (customerJourneys.length === 0) {
      if (Array.isArray(users) && users.length > 0) {
        const realJourneys = generateRealCustomerJourneys(users as any[]);
        setCustomerJourneys(realJourneys);
      } else {
        const mockJourneys = generateMockCustomerJourneys();
        setCustomerJourneys(mockJourneys);
      }
    }
  }, [users, customerJourneys.length]);

  const generateRealCustomerJourneys = (users: any[]): CustomerJourney[] => {
    const customers = users.filter(user => user.role === 'user' || user.role === 'customer');
    
    return customers.slice(0, 5).map((customer, index) => ({
      id: `journey-${customer.id}`,
      customerName: customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : customer.username,
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentStage: ['consideration', 'negotiation', 'purchase'][Math.floor(Math.random() * 3)],
      overallProgress: 30 + Math.random() * 50,
      totalValue: Math.floor(Math.random() * 500000) + 50000,
      stages: defaultJourneyStages.map(stage => ({
        ...stage,
        progress: stage.status === 'completed' ? 100 : 
                 stage.status === 'current' ? Math.random() * 100 : 0
      })),
      touchpoints: generateTouchpoints(),
      conversionRate: 60 + Math.random() * 30,
      engagementScore: 70 + Math.random() * 30
    }));
  };

  const generateMockCustomerJourneys = (): CustomerJourney[] => {
    const mockCustomers = ['Raj Patel', 'Priya Sharma', 'Amit Kumar', 'Sunita Singh', 'Vijay Gupta'];
    
    return mockCustomers.map((name, index) => ({
      id: `journey-${index + 1}`,
      customerName: name,
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentStage: ['consideration', 'negotiation', 'purchase'][Math.floor(Math.random() * 3)],
      overallProgress: 30 + Math.random() * 50,
      totalValue: Math.floor(Math.random() * 500000) + 50000,
      stages: defaultJourneyStages.map(stage => ({
        ...stage,
        progress: stage.status === 'completed' ? 100 : 
                 stage.status === 'current' ? Math.random() * 100 : 0
      })),
      touchpoints: generateTouchpoints(),
      conversionRate: 60 + Math.random() * 30,
      engagementScore: 70 + Math.random() * 30
    }));
  };

  const generateTouchpoints = (): TouchPoint[] => {
    const types: TouchPoint['type'][] = ['website', 'email', 'phone', 'store', 'social'];
    const actions = ['Product view', 'Price inquiry', 'Support chat', 'Catalog download', 'Quote request'];
    
    return Array.from({ length: 8 }, (_, index) => ({
      id: `touchpoint-${index}`,
      type: types[Math.floor(Math.random() * types.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      outcome: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
      value: Math.floor(Math.random() * 1000)
    }));
  };

  const currentJourney = customerJourneys.find(j => j.id === selectedJourney) || customerJourneys[0];

  const getStageIcon = (iconComponent: any) => {
    const Icon = iconComponent;
    return <Icon className="w-6 h-6" />;
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        setCustomerJourneys(prev => prev.map(journey => {
          if (journey.id === selectedJourney) {
            const updatedStages = journey.stages.map(stage => {
              if (stage.status === 'current') {
                return {
                  ...stage,
                  progress: Math.min(stage.progress + Math.random() * 5, 100)
                };
              }
              return stage;
            });
            
            return {
              ...journey,
              stages: updatedStages,
              overallProgress: Math.min(journey.overallProgress + Math.random() * 2, 100)
            };
          }
          return journey;
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, selectedJourney]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interactive Customer Journey Visualizer</h2>
          <p className="text-gray-600">Track and optimize customer interactions in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={realTimeUpdates ? "default" : "outline"}
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            className="gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${realTimeUpdates ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            Real-time Updates
          </Button>
          <select
            value={selectedJourney}
            onChange={(e) => setSelectedJourney(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            {customerJourneys.map((journey) => (
              <option key={journey.id} value={journey.id}>
                {journey.customerName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentJourney && (
        <>
          {/* Customer Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{currentJourney.customerName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-semibold">{Math.round(currentJourney.overallProgress)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Potential Value</p>
                    <p className="font-semibold">₹{currentJourney.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Engagement</p>
                    <p className="font-semibold">{Math.round(currentJourney.engagementScore)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Journey Timeline</TabsTrigger>
              <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-6">
              {/* Journey Stages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Customer Journey Stages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentJourney.stages.map((stage, index) => (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative flex items-start gap-4 p-4 rounded-lg border-2 ${
                          stage.status === 'current' 
                            ? 'border-blue-200 bg-blue-50' 
                            : stage.status === 'completed'
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          stage.status === 'current' 
                            ? 'bg-blue-600 text-white' 
                            : stage.status === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-400 text-white'
                        }`}>
                          {getStageIcon(stage.icon)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{stage.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={stage.status === 'current' ? 'default' : stage.status === 'completed' ? 'secondary' : 'outline'}>
                                {stage.status}
                              </Badge>
                              {stage.timeSpent !== '-' && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {stage.timeSpent}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{stage.description}</p>
                          
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-gray-500">{Math.round(stage.progress)}%</span>
                            </div>
                            <Progress value={stage.progress} className="h-2" />
                          </div>
                          
                          {stage.actions.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-2">Actions Taken:</h4>
                              <div className="flex flex-wrap gap-1">
                                {stage.actions.map((action, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {stage.insights.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-2">Insights:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {stage.insights.map((insight, idx) => (
                                  <li key={idx}>• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {stage.nextRecommendations.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Next Steps:</h4>
                              <div className="flex flex-wrap gap-1">
                                {stage.nextRecommendations.map((rec, idx) => (
                                  <Badge key={idx} variant="default" className="text-xs bg-blue-100 text-blue-800">
                                    {rec}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funnel" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentJourney.stages.map((stage, index) => {
                      const conversionRate = 100 - (index * 15);
                      const width = Math.max(conversionRate, 20);
                      
                      return (
                        <div key={stage.id} className="relative">
                          <div 
                            className={`mx-auto h-16 flex items-center justify-center rounded-lg text-white font-semibold transition-all duration-500 ${
                              stage.status === 'completed' ? 'bg-green-500' :
                              stage.status === 'current' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${width}%` }}
                          >
                            <span>{stage.name}</span>
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-sm text-gray-600">{conversionRate}% conversion</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Touchpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentJourney.touchpoints.slice(0, 5).map((touchpoint) => (
                        <div key={touchpoint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getOutcomeColor(touchpoint.outcome)}`}>
                              {touchpoint.type === 'website' && <Eye className="w-4 h-4" />}
                              {touchpoint.type === 'email' && <Mail className="w-4 h-4" />}
                              {touchpoint.type === 'phone' && <Phone className="w-4 h-4" />}
                              {touchpoint.type === 'store' && <MapPin className="w-4 h-4" />}
                              {touchpoint.type === 'social' && <Users className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{touchpoint.action}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(touchpoint.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={touchpoint.outcome === 'positive' ? 'default' : 'secondary'}>
                            {touchpoint.outcome}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Journey Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Overall Progress</span>
                          <span className="text-sm text-gray-500">{Math.round(currentJourney.overallProgress)}%</span>
                        </div>
                        <Progress value={currentJourney.overallProgress} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Conversion Rate</span>
                          <span className="text-sm text-gray-500">{Math.round(currentJourney.conversionRate)}%</span>
                        </div>
                        <Progress value={currentJourney.conversionRate} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Engagement Score</span>
                          <span className="text-sm text-gray-500">{Math.round(currentJourney.engagementScore)}%</span>
                        </div>
                        <Progress value={currentJourney.engagementScore} />
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">₹{Math.round(currentJourney.totalValue / 1000)}K</p>
                            <p className="text-xs text-gray-500">Potential Value</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{currentJourney.touchpoints.length}</p>
                            <p className="text-xs text-gray-500">Interactions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Immediate Actions</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li>• Send personalized follow-up email</li>
                    <li>• Schedule product demonstration</li>
                    <li>• Offer volume pricing discount</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Risk Alerts</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-yellow-700">
                    <li>• Customer engagement dropping</li>
                    <li>• Competitor comparison active</li>
                    <li>• Price sensitivity detected</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Opportunities</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• Cross-sell related products</li>
                    <li>• Upsell premium services</li>
                    <li>• Referral program enrollment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}