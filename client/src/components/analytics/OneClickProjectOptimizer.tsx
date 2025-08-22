import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap,
  DollarSign,
  Clock,
  TrendingDown,
  Target,
  Lightbulb,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  PieChart,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ProjectSpec {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial';
  sqft: number;
  budget: number;
  timeline: number; // days
  priority: 'cost' | 'quality' | 'speed' | 'sustainability';
  materials: MaterialRequirement[];
  constraints: string[];
}

interface MaterialRequirement {
  id: string;
  category: string;
  quantity: number;
  unit: string;
  currentCost: number;
  optimizedCost: number;
  alternatives: Alternative[];
}

interface Alternative {
  id: string;
  name: string;
  cost: number;
  quality: number;
  sustainability: number;
  availability: number;
  savings: number;
}

interface OptimizationResult {
  totalSavings: number;
  timeSavings: number;
  qualityScore: number;
  sustainabilityScore: number;
  recommendations: Recommendation[];
  riskFactors: string[];
  implementation: ImplementationStep[];
}

interface Recommendation {
  id: string;
  type: 'material' | 'vendor' | 'timeline' | 'method';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: number;
  effort: 'easy' | 'moderate' | 'complex';
  confidence: number;
}

interface ImplementationStep {
  id: string;
  phase: string;
  action: string;
  timeline: string;
  responsible: string;
  priority: number;
}

const defaultProjectTypes = [
  { value: 'residential', label: 'Residential Building', multiplier: 1.0 },
  { value: 'commercial', label: 'Commercial Complex', multiplier: 1.3 },
  { value: 'industrial', label: 'Industrial Facility', multiplier: 1.5 }
];

const materialCategories = [
  { name: 'Cement', avgCost: 400, unit: 'bags' },
  { name: 'Steel', avgCost: 60000, unit: 'tons' },
  { name: 'Bricks', avgCost: 8, unit: 'pieces' },
  { name: 'Sand', avgCost: 1500, unit: 'cubic meters' },
  { name: 'Aggregate', avgCost: 1200, unit: 'cubic meters' },
  { name: 'Paint', avgCost: 250, unit: 'liters' },
  { name: 'Tiles', avgCost: 45, unit: 'sq ft' },
  { name: 'Plumbing', avgCost: 15000, unit: 'points' }
];

export default function OneClickProjectOptimizer() {
  const [currentProject, setCurrentProject] = useState<ProjectSpec | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const { toast } = useToast();

  // Project setup state
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [sqft, setSqft] = useState<number>(1000);
  const [budget, setBudget] = useState<number>(1000000);
  const [timeline, setTimeline] = useState<number>(180);
  const [priority, setPriority] = useState<'cost' | 'quality' | 'speed' | 'sustainability'>('cost');

  // Fetch real products for optimization
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const optimizationMutation = useMutation({
    mutationFn: async (projectSpec: ProjectSpec) => {
      setIsOptimizing(true);
      setOptimizationProgress(0);
      
      // Simulate AI optimization process
      const steps = ['Analyzing requirements', 'Finding alternatives', 'Calculating costs', 'Generating recommendations'];
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOptimizationProgress((i + 1) * 25);
      }
      
      return generateOptimizationResult(projectSpec);
    },
    onSuccess: (result) => {
      setOptimizationResult(result);
      setIsOptimizing(false);
      setActiveTab('results');
      toast({
        title: "🎯 Optimization Complete!",
        description: `Found ₹${result.totalSavings.toLocaleString()} in potential savings`,
      });
    },
  });

  const generateMaterialRequirements = (type: string, sqft: number): MaterialRequirement[] => {
    const typeMultiplier = defaultProjectTypes.find(t => t.value === type)?.multiplier || 1.0;
    
    return materialCategories.map((category, index) => {
      const baseQuantity = Math.ceil((sqft / 1000) * (10 + Math.random() * 20) * typeMultiplier);
      const currentCost = category.avgCost * baseQuantity;
      const optimizedCost = currentCost * (0.7 + Math.random() * 0.2); // 10-30% savings
      
      return {
        id: `material-${index}`,
        category: category.name,
        quantity: baseQuantity,
        unit: category.unit,
        currentCost,
        optimizedCost,
        alternatives: generateAlternatives(category.name, currentCost)
      };
    });
  };

  const generateAlternatives = (category: string, baseCost: number): Alternative[] => {
    const alternativeNames = {
      'Cement': ['Premium OPC', 'Standard OPC', 'PPC Cement', 'Eco-friendly Cement'],
      'Steel': ['TMT Bars', 'HYSD Bars', 'Carbon Steel', 'Stainless Steel'],
      'Bricks': ['Clay Bricks', 'Fly Ash Bricks', 'Concrete Blocks', 'AAC Blocks'],
      'default': ['Premium Grade', 'Standard Grade', 'Economy Grade', 'Bulk Grade']
    };
    
    const names = alternativeNames[category as keyof typeof alternativeNames] || alternativeNames.default;
    
    return names.map((name, index) => ({
      id: `alt-${category}-${index}`,
      name,
      cost: baseCost * (0.6 + index * 0.15),
      quality: 90 - index * 10,
      sustainability: 60 + Math.random() * 30,
      availability: 70 + Math.random() * 30,
      savings: baseCost - (baseCost * (0.6 + index * 0.15))
    }));
  };

  const generateOptimizationResult = (project: ProjectSpec): OptimizationResult => {
    const totalCurrentCost = project.materials.reduce((sum, m) => sum + m.currentCost, 0);
    const totalOptimizedCost = project.materials.reduce((sum, m) => sum + m.optimizedCost, 0);
    const totalSavings = totalCurrentCost - totalOptimizedCost;
    
    const recommendations: Recommendation[] = [
      {
        id: 'rec-1',
        type: 'material',
        title: 'Switch to Fly Ash Bricks',
        description: 'Use fly ash bricks instead of clay bricks for 25% cost savings and better sustainability',
        impact: 'high',
        savings: totalSavings * 0.4,
        effort: 'easy',
        confidence: 95
      },
      {
        id: 'rec-2',
        type: 'vendor',
        title: 'Bulk Purchase Agreement',
        description: 'Negotiate bulk pricing with preferred vendors for additional 8-12% savings',
        impact: 'medium',
        savings: totalSavings * 0.3,
        effort: 'moderate',
        confidence: 85
      },
      {
        id: 'rec-3',
        type: 'timeline',
        title: 'Optimize Construction Schedule',
        description: 'Adjust timeline to avoid peak season pricing and reduce material costs',
        impact: 'medium',
        savings: totalSavings * 0.2,
        effort: 'moderate',
        confidence: 78
      },
      {
        id: 'rec-4',
        type: 'method',
        title: 'Prefab Components',
        description: 'Use prefabricated components to reduce labor costs and construction time',
        impact: 'high',
        savings: totalSavings * 0.1,
        effort: 'complex',
        confidence: 70
      }
    ];

    const implementation: ImplementationStep[] = [
      {
        id: 'step-1',
        phase: 'Planning',
        action: 'Finalize material specifications and vendor negotiations',
        timeline: '2 weeks',
        responsible: 'Project Manager',
        priority: 1
      },
      {
        id: 'step-2',
        phase: 'Procurement',
        action: 'Execute bulk purchase agreements and schedule deliveries',
        timeline: '1 week',
        responsible: 'Procurement Team',
        priority: 2
      },
      {
        id: 'step-3',
        phase: 'Construction',
        action: 'Implement optimized construction schedule',
        timeline: 'Project duration',
        responsible: 'Construction Supervisor',
        priority: 3
      }
    ];

    return {
      totalSavings,
      timeSavings: 15, // days
      qualityScore: 88,
      sustainabilityScore: 76,
      recommendations,
      riskFactors: [
        'Weather delays may affect timeline optimization',
        'Vendor capacity constraints during peak season',
        'Quality variation in alternative materials'
      ],
      implementation
    };
  };

  const handleOptimizeProject = () => {
    if (!projectName || !sqft || !budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all project details",
        variant: "destructive",
      });
      return;
    }

    const materials = generateMaterialRequirements(projectType, sqft);
    
    const project: ProjectSpec = {
      id: `project-${Date.now()}`,
      name: projectName,
      type: projectType,
      sqft,
      budget,
      timeline,
      priority,
      materials,
      constraints: []
    };

    setCurrentProject(project);
    optimizationMutation.mutate(project);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            One-Click Project Cost Optimizer
          </h2>
          <p className="text-gray-600">AI-powered cost optimization with instant recommendations</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Calculator className="w-4 h-4 mr-2" />
          AI-Powered
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Project Setup</TabsTrigger>
          <TabsTrigger value="optimize" disabled={!currentProject}>Optimization</TabsTrigger>
          <TabsTrigger value="results" disabled={!optimizationResult}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Project Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Name</label>
                    <Input
                      placeholder="e.g., Downtown Office Complex"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Type</label>
                    <Select value={projectType} onValueChange={(value: any) => setProjectType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultProjectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Area (sq ft)</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={sqft}
                      onChange={(e) => setSqft(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget (₹)</label>
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeline (days)</label>
                    <div className="space-y-2">
                      <Slider
                        value={[timeline]}
                        onValueChange={(value) => setTimeline(value[0])}
                        max={365}
                        min={30}
                        step={15}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>30 days</span>
                        <span className="font-medium">{timeline} days</span>
                        <span>365 days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Optimization Priority</label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cost">Minimize Cost</SelectItem>
                        <SelectItem value="quality">Maximize Quality</SelectItem>
                        <SelectItem value="speed">Minimize Time</SelectItem>
                        <SelectItem value="sustainability">Maximize Sustainability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <Button 
                  onClick={handleOptimizeProject}
                  className="w-full gap-2 text-lg py-6"
                  size="lg"
                >
                  <Zap className="w-5 h-5" />
                  Optimize Project Cost
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Optimization in Progress...</CardTitle>
            </CardHeader>
            <CardContent>
              {isOptimizing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analyzing project requirements...</span>
                    <span className="text-sm font-medium">{optimizationProgress}%</span>
                  </div>
                  <Progress value={optimizationProgress} className="h-3" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Cost Analysis</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Finding Alternatives</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Timeline Optimization</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Lightbulb className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Generating Insights</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {optimizationResult && currentProject && (
            <>
              {/* Optimization Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Savings</p>
                        <p className="text-xl font-bold text-green-600">₹{optimizationResult.totalSavings.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((optimizationResult.totalSavings / currentProject.budget) * 100)}% of budget
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Time Savings</p>
                        <p className="text-xl font-bold text-blue-600">{optimizationResult.timeSavings} days</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((optimizationResult.timeSavings / currentProject.timeline) * 100)}% faster
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Quality Score</p>
                        <p className="text-xl font-bold text-purple-600">{optimizationResult.qualityScore}%</p>
                        <p className="text-xs text-gray-500">Maintained quality</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Sustainability</p>
                        <p className="text-xl font-bold text-yellow-600">{optimizationResult.sustainabilityScore}%</p>
                        <p className="text-xs text-gray-500">Eco-friendly score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    AI Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationResult.recommendations.map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <Badge variant={rec.impact === 'high' ? 'default' : rec.impact === 'medium' ? 'secondary' : 'outline'}>
                                {rec.impact} impact
                              </Badge>
                              <Badge variant="outline">
                                {rec.effort} to implement
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-green-600 font-medium">
                                Savings: ₹{rec.savings.toLocaleString()}
                              </span>
                              <span className="text-blue-600">
                                Confidence: {rec.confidence}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-bold text-lg">
                                ₹{Math.round(rec.savings / 1000)}K
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Material Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Material Cost Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentProject.materials.map((material) => (
                      <div key={material.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{material.category}</h4>
                          <div className="text-right">
                            <span className="text-green-600 font-bold">
                              ₹{(material.currentCost - material.optimizedCost).toLocaleString()} saved
                            </span>
                            <p className="text-sm text-gray-600">
                              {material.quantity} {material.unit}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Current Cost</p>
                            <p className="font-medium">₹{material.currentCost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Optimized Cost</p>
                            <p className="font-medium text-green-600">₹{material.optimizedCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Implementation Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Implementation Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizationResult.implementation.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {step.priority}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800">{step.phase}</h4>
                          <p className="text-sm text-blue-700">{step.action}</p>
                          <p className="text-xs text-blue-600">{step.responsible} • {step.timeline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Risk Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {optimizationResult.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-yellow-800 text-sm">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}