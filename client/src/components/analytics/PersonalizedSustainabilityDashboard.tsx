import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf,
  TreePine,
  Recycle,
  Zap,
  Droplets,
  Sun,
  Wind,
  Target,
  TrendingUp,
  Award,
  Calculator,
  Globe,
  Heart,
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface SustainabilityMetrics {
  carbonFootprint: number; // kg CO2
  carbonReduction: number; // % reduction
  recycledContent: number; // % recycled materials
  energyEfficiency: number; // score 0-100
  waterConservation: number; // % water saved
  wasteReduction: number; // % waste reduced
  sustainabilityScore: number; // overall score 0-100
  greenCertifications: number;
}

interface EcoFriendlyMaterial {
  id: string;
  name: string;
  category: string;
  sustainabilityRating: number;
  carbonFootprint: number;
  recycledContent: number;
  renewableSource: boolean;
  locallySourced: boolean;
  certifications: string[];
  costComparison: number; // % vs conventional
  availabilityScore: number;
  impactReduction: {
    carbon: number;
    water: number;
    waste: number;
  };
}

interface SustainabilityGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: 'carbon' | 'energy' | 'water' | 'waste' | 'materials';
  reward: number;
  completed: boolean;
}

interface ImpactCalculation {
  category: string;
  conventional: number;
  sustainable: number;
  reduction: number;
  unit: string;
  monetaryValue: number;
}

const defaultMetrics: SustainabilityMetrics = {
  carbonFootprint: 2850,
  carbonReduction: 15,
  recycledContent: 25,
  energyEfficiency: 68,
  waterConservation: 12,
  wasteReduction: 18,
  sustainabilityScore: 72,
  greenCertifications: 3
};

const ecoMaterials: EcoFriendlyMaterial[] = [
  {
    id: 'eco-cement-1',
    name: 'Fly Ash Blended Cement',
    category: 'Cement',
    sustainabilityRating: 85,
    carbonFootprint: 320, // kg CO2 per ton
    recycledContent: 40,
    renewableSource: false,
    locallySourced: true,
    certifications: ['Green Building', 'LEED Certified'],
    costComparison: 5, // 5% more than conventional
    availabilityScore: 90,
    impactReduction: {
      carbon: 35,
      water: 20,
      waste: 40
    }
  },
  {
    id: 'eco-steel-1',
    name: 'Recycled Steel Bars',
    category: 'Steel',
    sustainabilityRating: 92,
    carbonFootprint: 1100, // kg CO2 per ton
    recycledContent: 85,
    renewableSource: false,
    locallySourced: true,
    certifications: ['Carbon Neutral', 'Recycled Content'],
    costComparison: -2, // 2% less than conventional
    availabilityScore: 95,
    impactReduction: {
      carbon: 60,
      water: 45,
      waste: 85
    }
  },
  {
    id: 'eco-brick-1',
    name: 'Compressed Earth Blocks',
    category: 'Bricks',
    sustainabilityRating: 88,
    carbonFootprint: 45, // kg CO2 per 1000 bricks
    recycledContent: 0,
    renewableSource: true,
    locallySourced: true,
    certifications: ['Natural Building', 'Low Carbon'],
    costComparison: -15, // 15% less than conventional
    availabilityScore: 75,
    impactReduction: {
      carbon: 70,
      water: 30,
      waste: 50
    }
  },
  {
    id: 'eco-insulation-1',
    name: 'Recycled Cotton Insulation',
    category: 'Insulation',
    sustainabilityRating: 90,
    carbonFootprint: 12, // kg CO2 per m3
    recycledContent: 95,
    renewableSource: true,
    locallySourced: false,
    certifications: ['Recycled Content', 'Non-Toxic'],
    costComparison: 10, // 10% more than conventional
    availabilityScore: 65,
    impactReduction: {
      carbon: 45,
      water: 35,
      waste: 95
    }
  }
];

const sustainabilityGoals: SustainabilityGoal[] = [
  {
    id: 'carbon-goal-1',
    title: 'Reduce Carbon Footprint',
    description: 'Achieve 25% reduction in project carbon emissions',
    targetValue: 25,
    currentValue: 15,
    unit: '% reduction',
    deadline: '2024-12-31',
    priority: 'high',
    category: 'carbon',
    reward: 500,
    completed: false
  },
  {
    id: 'recycle-goal-1',
    title: 'Increase Recycled Content',
    description: 'Use 50% recycled materials in projects',
    targetValue: 50,
    currentValue: 25,
    unit: '% recycled',
    deadline: '2024-10-31',
    priority: 'medium',
    category: 'materials',
    reward: 300,
    completed: false
  },
  {
    id: 'energy-goal-1',
    title: 'Energy Efficiency Score',
    description: 'Achieve 85+ energy efficiency rating',
    targetValue: 85,
    currentValue: 68,
    unit: 'efficiency score',
    deadline: '2024-11-30',
    priority: 'medium',
    category: 'energy',
    reward: 400,
    completed: false
  }
];

export default function PersonalizedSustainabilityDashboard() {
  const [metrics, setMetrics] = useState<SustainabilityMetrics>(defaultMetrics);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [impactCalculations, setImpactCalculations] = useState<ImpactCalculation[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [projectSize, setProjectSize] = useState(1000); // sq ft
  const { toast } = useToast();

  // Fetch real data
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  useEffect(() => {
    // Calculate impact based on selected materials and project size
    if (selectedMaterials.length > 0) {
      const calculations = calculateEnvironmentalImpact();
      setImpactCalculations(calculations);
    }
  }, [selectedMaterials, projectSize]);

  const calculateEnvironmentalImpact = (): ImpactCalculation[] => {
    const calculations: ImpactCalculation[] = [];
    
    selectedMaterials.forEach(materialId => {
      const material = ecoMaterials.find(m => m.id === materialId);
      if (material) {
        const conventionalCarbon = material.carbonFootprint / (1 - material.impactReduction.carbon / 100);
        const carbonReduction = conventionalCarbon - material.carbonFootprint;
        
        calculations.push({
          category: material.category,
          conventional: conventionalCarbon,
          sustainable: material.carbonFootprint,
          reduction: carbonReduction,
          unit: 'kg CO2',
          monetaryValue: carbonReduction * 0.05 // $0.05 per kg CO2 saved
        });
      }
    });
    
    return calculations;
  };

  const addMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      // Simulate adding eco-friendly material
      await new Promise(resolve => setTimeout(resolve, 500));
      return materialId;
    },
    onSuccess: (materialId) => {
      if (!selectedMaterials.includes(materialId)) {
        setSelectedMaterials(prev => [...prev, materialId]);
        
        // Update metrics
        const material = ecoMaterials.find(m => m.id === materialId);
        if (material) {
          setMetrics(prev => ({
            ...prev,
            carbonReduction: Math.min(prev.carbonReduction + 5, 100),
            recycledContent: Math.min(prev.recycledContent + material.recycledContent / 4, 100),
            sustainabilityScore: Math.min(prev.sustainabilityScore + 3, 100)
          }));
          
          toast({
            title: "🌱 Eco-Material Added!",
            description: `${material.name} will reduce your carbon footprint by ${material.impactReduction.carbon}%`,
          });
        }
      }
    },
  });

  const setGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      // Simulate setting/updating goal
      await new Promise(resolve => setTimeout(resolve, 300));
      return goalId;
    },
    onSuccess: (goalId) => {
      const goal = sustainabilityGoals.find(g => g.id === goalId);
      if (goal && goal.currentValue >= goal.targetValue) {
        goal.completed = true;
        setMetrics(prev => ({
          ...prev,
          sustainabilityScore: Math.min(prev.sustainabilityScore + 5, 100)
        }));
        
        toast({
          title: "🏆 Goal Achieved!",
          description: `You've completed "${goal.title}" and earned ${goal.reward} eco-points!`,
        });
      }
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'carbon': return <Globe className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      case 'water': return <Droplets className="w-5 h-5" />;
      case 'waste': return <Recycle className="w-5 h-5" />;
      case 'materials': return <TreePine className="w-5 h-5" />;
      default: return <Leaf className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            Personalized Sustainability Dashboard
          </h2>
          <p className="text-gray-600">Track and optimize your environmental impact in construction</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <TreePine className="w-4 h-4 mr-2 text-green-600" />
            Eco Score: {metrics.sustainabilityScore}
          </Badge>
        </div>
      </div>

      {/* Sustainability Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Carbon Footprint</p>
                <p className="text-xl font-bold text-blue-600">{metrics.carbonFootprint} kg</p>
                <p className="text-xs text-green-600">↓ {metrics.carbonReduction}% reduced</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Recycle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Recycled Content</p>
                <p className="text-xl font-bold text-green-600">{metrics.recycledContent}%</p>
                <p className="text-xs text-gray-500">of total materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Energy Efficiency</p>
                <p className="text-xl font-bold text-yellow-600">{metrics.energyEfficiency}/100</p>
                <p className="text-xs text-gray-500">efficiency score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Green Certifications</p>
                <p className="text-xl font-bold text-purple-600">{metrics.greenCertifications}</p>
                <p className="text-xs text-gray-500">earned badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Overall Sustainability Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Current Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(metrics.sustainabilityScore)}`}>
                {metrics.sustainabilityScore}/100
              </span>
            </div>
            <Progress value={metrics.sustainabilityScore} className="h-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Carbon Impact</p>
                <div className={`w-full h-2 rounded-full ${getProgressColor(100 - metrics.carbonReduction)}`} />
                <p className="font-medium">{100 - metrics.carbonReduction}% emissions</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Material Sustainability</p>
                <div className={`w-full h-2 rounded-full ${getProgressColor(metrics.recycledContent)}`} />
                <p className="font-medium">{metrics.recycledContent}% sustainable</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Energy Efficiency</p>
                <div className={`w-full h-2 rounded-full ${getProgressColor(metrics.energyEfficiency)}`} />
                <p className="font-medium">{metrics.energyEfficiency}% efficient</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Water Conservation</p>
                <div className={`w-full h-2 rounded-full ${getProgressColor(metrics.waterConservation)}`} />
                <p className="font-medium">{metrics.waterConservation}% saved</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Impact Overview</TabsTrigger>
          <TabsTrigger value="materials">Eco Materials</TabsTrigger>
          <TabsTrigger value="goals">Sustainability Goals</TabsTrigger>
          <TabsTrigger value="calculator">Impact Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Environmental Impact Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Carbon Emissions
                      </span>
                      <span className="text-sm text-gray-500">{metrics.carbonFootprint} kg CO2</span>
                    </div>
                    <Progress value={100 - metrics.carbonReduction} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Water Usage
                      </span>
                      <span className="text-sm text-gray-500">{100 - metrics.waterConservation}% of baseline</span>
                    </div>
                    <Progress value={100 - metrics.waterConservation} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Recycle className="w-4 h-4" />
                        Waste Generated
                      </span>
                      <span className="text-sm text-gray-500">{100 - metrics.wasteReduction}% of baseline</span>
                    </div>
                    <Progress value={100 - metrics.wasteReduction} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Energy Consumption
                      </span>
                      <span className="text-sm text-gray-500">{100 - metrics.energyEfficiency}% of baseline</span>
                    </div>
                    <Progress value={100 - metrics.energyEfficiency} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Sustainability Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">Positive Trends</h4>
                    </div>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>• Carbon footprint reduced by {metrics.carbonReduction}% this month</li>
                      <li>• Recycled content increased to {metrics.recycledContent}%</li>
                      <li>• Energy efficiency improved by 8 points</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800">Areas for Improvement</h4>
                    </div>
                    <ul className="text-sm space-y-1 text-yellow-700">
                      <li>• Water conservation still below target</li>
                      <li>• Waste reduction needs attention</li>
                      <li>• Consider more local material sourcing</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Impact Summary</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your sustainable choices have saved approximately{' '}
                      <span className="font-bold">{Math.round(metrics.carbonFootprint * metrics.carbonReduction / 100)} kg CO2</span>{' '}
                      this year, equivalent to planting{' '}
                      <span className="font-bold">{Math.round(metrics.carbonFootprint * metrics.carbonReduction / 100 / 22)} trees</span>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ecoMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${selectedMaterials.includes(material.id) ? 'border-green-200 bg-green-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{material.name}</h3>
                        <p className="text-sm text-gray-600">{material.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">{material.sustainabilityRating}/100</span>
                        </div>
                        {material.locallySourced && (
                          <Badge variant="secondary" className="text-xs">
                            Local
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Environmental Impact */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Carbon Reduction</p>
                          <p className="font-bold text-green-600">{material.impactReduction.carbon}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Water Saving</p>
                          <p className="font-bold text-blue-600">{material.impactReduction.water}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Waste Reduction</p>
                          <p className="font-bold text-purple-600">{material.impactReduction.waste}%</p>
                        </div>
                      </div>

                      {/* Material Properties */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Recycled Content</span>
                          <span className="font-medium">{material.recycledContent}%</span>
                        </div>
                        <Progress value={material.recycledContent} className="h-1" />
                        
                        <div className="flex justify-between items-center text-sm">
                          <span>Availability</span>
                          <span className="font-medium">{material.availabilityScore}%</span>
                        </div>
                        <Progress value={material.availabilityScore} className="h-1" />
                      </div>

                      {/* Cost Comparison */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cost vs Conventional</span>
                          <span className={`font-medium ${material.costComparison > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {material.costComparison > 0 ? '+' : ''}{material.costComparison}%
                          </span>
                        </div>
                      </div>

                      {/* Certifications */}
                      {material.certifications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Certifications:</p>
                          <div className="flex flex-wrap gap-1">
                            {material.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        onClick={() => addMaterialMutation.mutate(material.id)}
                        disabled={selectedMaterials.includes(material.id)}
                        className="w-full gap-2"
                        variant={selectedMaterials.includes(material.id) ? "secondary" : "default"}
                      >
                        {selectedMaterials.includes(material.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Added to Project
                          </>
                        ) : (
                          <>
                            <Leaf className="w-4 h-4" />
                            Use This Material
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="space-y-4">
            {sustainabilityGoals.map((goal) => (
              <Card key={goal.id} className={goal.completed ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-600' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                            {goal.priority} priority
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Progress</span>
                              <span className="text-sm text-gray-500">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </span>
                            </div>
                            <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              Deadline: {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                            <span className="text-yellow-600 font-medium">
                              Reward: {goal.reward} eco-points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {goal.completed ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1" />
                          <span className="text-xs text-green-600">Completed</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setGoalMutation.mutate(goal.id)}
                          variant="outline"
                          size="sm"
                        >
                          Track Progress
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Environmental Impact Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Size (sq ft)</label>
                  <input
                    type="number"
                    value={projectSize}
                    onChange={(e) => setProjectSize(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Selected Sustainable Materials:</h4>
                  <div className="space-y-2">
                    {selectedMaterials.map(materialId => {
                      const material = ecoMaterials.find(m => m.id === materialId);
                      return material ? (
                        <div key={materialId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">{material.name}</span>
                          <Badge variant="secondary">
                            -{material.impactReduction.carbon}% CO2
                          </Badge>
                        </div>
                      ) : null;
                    })}
                    {selectedMaterials.length === 0 && (
                      <p className="text-gray-500 text-sm">No eco-materials selected yet</p>
                    )}
                  </div>
                </div>
                
                {impactCalculations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Environmental Impact Calculations:</h4>
                    <div className="space-y-4">
                      {impactCalculations.map((calc, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-2">{calc.category}</h5>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Conventional</p>
                              <p className="font-bold">{calc.conventional.toFixed(1)} {calc.unit}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Sustainable</p>
                              <p className="font-bold text-green-600">{calc.sustainable.toFixed(1)} {calc.unit}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Reduction</p>
                              <p className="font-bold text-blue-600">{calc.reduction.toFixed(1)} {calc.unit}</p>
                              <p className="text-xs text-gray-500">≈ ${calc.monetaryValue.toFixed(2)} saved</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">Total Environmental Savings</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-600">Total CO2 Reduction</p>
                            <p className="text-xl font-bold text-blue-800">
                              {impactCalculations.reduce((sum, calc) => sum + calc.reduction, 0).toFixed(1)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-600">Monetary Value</p>
                            <p className="text-xl font-bold text-blue-800">
                              ${impactCalculations.reduce((sum, calc) => sum + calc.monetaryValue, 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}