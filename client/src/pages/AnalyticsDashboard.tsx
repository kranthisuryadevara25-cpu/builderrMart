import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Scale, Building2, Leaf, Sparkles, BarChart3, MapPin, Zap, Brain, Users, MessageCircle, DollarSign, Calculator, TreePine, Activity, Trophy } from 'lucide-react';
import MaterialTrendsVisualizer from '@/components/analytics/MaterialTrendsVisualizer';
import MaterialComparisonDashboard from '@/components/analytics/MaterialComparisonDashboard';
import ProjectJourneyTracker from '@/components/analytics/ProjectJourneyTracker';
import SustainabilityScorer from '@/components/analytics/SustainabilityScorer';
import PersonalizedRecommendations from '@/components/analytics/PersonalizedRecommendations';
import InteractivePriceHeatMap from '@/components/analytics/InteractivePriceHeatMap';
import SustainabilityComparisonWizard from '@/components/analytics/SustainabilityComparisonWizard';
import AIPersonalityMatcher from '@/components/analytics/AIPersonalityMatcher';
import VendorPerformanceStorytellingDashboard from '@/components/analytics/VendorPerformanceStorytellingDashboard';
import PlayfulProjectJourneyAnimator from '@/components/analytics/PlayfulProjectJourneyAnimator';
import InteractiveVendorChat from '@/components/analytics/InteractiveVendorChat';
import RealTimePriceNegotiation from '@/components/analytics/RealTimePriceNegotiation';
import SmartBudgetCalculator from '@/components/analytics/SmartBudgetCalculator';
import EcoImpactCalculator from '@/components/analytics/EcoImpactCalculator';
import PredictiveMaterialForecast from '@/components/analytics/PredictiveMaterialForecast';
import InteractiveCustomerJourney from '@/components/analytics/InteractiveCustomerJourney';
import OneClickProjectOptimizer from '@/components/analytics/OneClickProjectOptimizer';
import AIRecommendationEngine from '@/components/analytics/AIRecommendationEngine';
import GamifiedLearningHub from '@/components/analytics/GamifiedLearningHub';
import PersonalizedSustainabilityDashboard from '@/components/analytics/PersonalizedSustainabilityDashboard';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('heatmap');

  const analyticsFeatures = [
    {
      id: 'trends',
      name: 'Price Trends',
      icon: TrendingUp,
      description: 'Animated material price trend visualizer with market predictions',
      component: MaterialTrendsVisualizer,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'heatmap',
      name: 'Interactive Price Heat Map',
      icon: MapPin,
      description: 'Real-time regional price visualization with market insights',
      component: InteractivePriceHeatMap,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'comparison',
      name: 'Material Comparison',
      icon: Scale,
      description: 'One-click material comparison dashboard with AI insights',
      component: MaterialComparisonDashboard,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'sustainability-wizard',
      name: 'Sustainability Comparison Wizard',
      icon: Leaf,
      description: 'One-click sustainability comparison with weighted scoring',
      component: SustainabilityComparisonWizard,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'ai-matcher',
      name: 'AI Material Matchmaker',
      icon: Brain,
      description: 'Personality-based material recommendations with AI insights',
      component: AIPersonalityMatcher,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'vendor-performance',
      name: 'Vendor Performance Stories',
      icon: Users,
      description: 'Interactive vendor analytics with storytelling insights',
      component: VendorPerformanceStorytellingDashboard,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 'playful-projects',
      name: 'Playful Project Journey Animator',
      icon: Zap,
      description: 'Fun animated project tracking with celebrations and milestones',
      component: PlayfulProjectJourneyAnimator,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'vendor-chat',
      name: 'Interactive Vendor Chat',
      icon: MessageCircle,
      description: 'Real-time chat support with vendors and instant communication',
      component: InteractiveVendorChat,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'price-negotiation',
      name: 'Real-time Price Negotiation',
      icon: DollarSign,
      description: 'Dynamic price negotiation tool with live market data',
      component: RealTimePriceNegotiation,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'budget-calculator',
      name: 'Smart Budget Calculator',
      icon: Calculator,
      description: 'AI-powered project budget planning with cost optimization',
      component: SmartBudgetCalculator,
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      id: 'eco-impact',
      name: 'Eco-Impact Carbon Calculator',
      icon: TreePine,
      description: 'Environmental impact assessment with carbon footprint tracking',
      component: EcoImpactCalculator,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 'material-forecast',
      name: 'Predictive Material Forecast',
      icon: Activity,
      description: 'AI-driven material availability and price predictions',
      component: PredictiveMaterialForecast,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'customer-journey',
      name: 'Interactive Customer Journey',
      icon: MapPin,
      description: 'Visualize and optimize customer interactions in real-time',
      component: InteractiveCustomerJourney,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'project-optimizer',
      name: 'One-Click Project Optimizer',
      icon: Zap,
      description: 'AI-powered cost optimization with instant recommendations',
      component: OneClickProjectOptimizer,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'ai-recommendations',
      name: 'AI Recommendation Engine',
      icon: Brain,
      description: 'Personalized material suggestions powered by machine learning',
      component: AIRecommendationEngine,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'learning-hub',
      name: 'Gamified Learning Hub',
      icon: Trophy,
      description: 'Interactive learning platform for construction professionals',
      component: GamifiedLearningHub,
      color: 'bg-rose-100 text-rose-600'
    },
    {
      id: 'sustainability-dashboard',
      name: 'Sustainability Dashboard',
      icon: Leaf,
      description: 'Track and optimize your environmental impact in construction',
      component: PersonalizedSustainabilityDashboard,
      color: 'bg-teal-100 text-teal-600'
    }
  ];

  const renderActiveComponent = () => {
    const feature = analyticsFeatures.find(f => f.id === activeTab);
    if (!feature) return null;
    
    const Component = feature.component;
    return <Component />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive material analytics with AI-powered insights
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <BarChart3 className="w-4 h-4 mr-2" />
          17 Tools
        </Badge>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {analyticsFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const isActive = activeTab === feature.id;
          
          return (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all duration-200 ${
                isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Analytics Content */}
      <Card className="min-h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const feature = analyticsFeatures.find(f => f.id === activeTab);
              const IconComponent = feature?.icon || TrendingUp;
              return (
                <>
                  <IconComponent className="w-6 h-6 text-blue-600" />
                  {feature?.name} Dashboard
                </>
              );
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderActiveComponent()}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Materials Analyzed</p>
                <p className="text-2xl font-bold">150+</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Comparisons Made</p>
                <p className="text-2xl font-bold">1,240</p>
              </div>
              <Scale className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sustainability Score</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Leaf className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}