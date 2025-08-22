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
import { Textarea } from '@/components/ui/textarea';
import { 
  Calculator,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  Calendar,
  MapPin,
  Zap,
  Target,
  Clock,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BudgetProject {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial';
  area: number;
  location: string;
  timeline: number; // months
  status: 'planning' | 'active' | 'completed';
  totalBudget: number;
  spentAmount: number;
  estimatedCost: number;
  actualCost?: number;
  materials: MaterialBudgetItem[];
  laborCost: number;
  overheadCost: number;
  contingency: number;
  createdAt: string;
  updatedAt: string;
}

interface MaterialBudgetItem {
  id: string;
  productId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  estimatedDelivery: string;
  priceHistory: PricePoint[];
  marketTrend: 'rising' | 'falling' | 'stable';
  alternativeOptions: AlternativeOption[];
  criticalPath: boolean;
}

interface AlternativeOption {
  id: string;
  name: string;
  supplier: string;
  price: number;
  quality: number;
  availability: 'in-stock' | 'limited' | 'out-of-stock';
  savingsPotential: number;
}

interface PricePoint {
  date: string;
  price: number;
  source: string;
}

interface BudgetAnalysis {
  totalCost: number;
  costBreakdown: {
    materials: number;
    labor: number;
    overhead: number;
    contingency: number;
  };
  riskFactors: RiskFactor[];
  optimizationOpportunities: OptimizationOpportunity[];
  timeline: TimelinePhase[];
  costTrends: CostTrend[];
}

interface RiskFactor {
  id: string;
  type: 'price_volatility' | 'supply_shortage' | 'timeline_delay' | 'quality_issue';
  severity: 'low' | 'medium' | 'high';
  impact: number;
  description: string;
  mitigation: string;
}

interface OptimizationOpportunity {
  id: string;
  type: 'bulk_discount' | 'alternative_material' | 'timing_optimization' | 'supplier_negotiation';
  potential_savings: number;
  effort_level: 'low' | 'medium' | 'high';
  description: string;
  action_required: string;
}

interface TimelinePhase {
  phase: string;
  startDate: string;
  endDate: string;
  cost: number;
  materials: string[];
  dependencies: string[];
}

interface CostTrend {
  category: string;
  currentCost: number;
  projectedCost: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

export default function SmartBudgetCalculator() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [projects, setProjects] = useState<BudgetProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    type: 'residential' as const,
    area: '',
    location: '',
    timeline: 6
  });
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real products and categories
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      setIsCalculating(true);
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProject = generateSmartBudgetProject(projectData, products as any[]);
      return newProject;
    },
    onSuccess: (project) => {
      setProjects(prev => [...prev, project]);
      setSelectedProject(project.id);
      generateBudgetAnalysis(project);
      setIsCalculating(false);
      toast({
        title: "Smart Budget Created! 💰",
        description: `Budget analysis for ${project.name} is ready`,
      });
      setNewProject({ name: '', type: 'residential', area: '', location: '', timeline: 6 });
    },
    onError: () => {
      setIsCalculating(false);
    }
  });

  // Generate realistic budget projects from real data
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const sampleProjects = generateSampleProjects(products as any[]);
      setProjects(sampleProjects);
      if (sampleProjects.length > 0) {
        setSelectedProject(sampleProjects[0].id);
        generateBudgetAnalysis(sampleProjects[0]);
      }
    }
  }, [products]);

  const generateSampleProjects = (products: any[]): BudgetProject[] => {
    const sampleProjects = [
      { name: 'Modern Villa Construction', type: 'residential' as const, area: 2500, location: 'Mumbai', timeline: 12 },
      { name: 'Office Complex Build', type: 'commercial' as const, area: 5000, location: 'Delhi', timeline: 18 },
      { name: 'Warehouse Development', type: 'industrial' as const, area: 10000, location: 'Bangalore', timeline: 10 }
    ];

    return sampleProjects.map((project, index) => 
      generateSmartBudgetProject(project, products, `existing-${index}`)
    );
  };

  const generateSmartBudgetProject = (projectData: any, products: any[], existingId?: string): BudgetProject => {
    const id = existingId || `project-${Date.now()}`;
    
    // Calculate base costs per sq ft based on project type
    const baseCostPerSqFt = {
      residential: 2000,
      commercial: 2500,
      industrial: 1800
    };

    const baseUnitCost = baseCostPerSqFt[projectData.type];
    const area = Number(projectData.area);
    const estimatedTotalCost = area * baseUnitCost;

    // Generate material requirements based on real products
    const materials = generateMaterialRequirements(area, projectData.type, products);
    const materialsCost = materials.reduce((sum, material) => sum + material.totalPrice, 0);
    
    // Calculate other costs
    const laborCost = materialsCost * 0.4; // 40% of materials cost
    const overheadCost = (materialsCost + laborCost) * 0.15; // 15% overhead
    const contingency = (materialsCost + laborCost + overheadCost) * 0.1; // 10% contingency

    const totalBudget = materialsCost + laborCost + overheadCost + contingency;

    return {
      id,
      name: projectData.name,
      type: projectData.type,
      area,
      location: projectData.location,
      timeline: projectData.timeline,
      status: existingId ? 'planning' : 'planning',
      totalBudget,
      spentAmount: existingId ? totalBudget * (0.1 + Math.random() * 0.3) : 0,
      estimatedCost: totalBudget,
      materials,
      laborCost,
      overheadCost,
      contingency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const generateMaterialRequirements = (area: number, type: string, products: any[]): MaterialBudgetItem[] => {
    // Define material requirements per sq ft for different project types
    const materialRequirements = {
      residential: [
        { category: 'cement', quantity: 0.4, unit: 'bags' },
        { category: 'steel', quantity: 3.5, unit: 'kg' },
        { category: 'bricks', quantity: 35, unit: 'pieces' },
        { category: 'paint', quantity: 0.15, unit: 'liters' },
        { category: 'tiles', quantity: 1.1, unit: 'sq ft' }
      ],
      commercial: [
        { category: 'cement', quantity: 0.5, unit: 'bags' },
        { category: 'steel', quantity: 4.2, unit: 'kg' },
        { category: 'bricks', quantity: 40, unit: 'pieces' },
        { category: 'glass', quantity: 0.3, unit: 'sq ft' },
        { category: 'paint', quantity: 0.12, unit: 'liters' }
      ],
      industrial: [
        { category: 'cement', quantity: 0.6, unit: 'bags' },
        { category: 'steel', quantity: 5.5, unit: 'kg' },
        { category: 'bricks', quantity: 25, unit: 'pieces' },
        { category: 'roofing', quantity: 1.05, unit: 'sq ft' }
      ]
    };

    const requirements = materialRequirements[type as keyof typeof materialRequirements] || materialRequirements.residential;

    return requirements.map((req, index) => {
      // Find matching products from real data
      const matchingProducts = products.filter(p => 
        p.name?.toLowerCase().includes(req.category) || 
        p.categoryName?.toLowerCase().includes(req.category)
      );
      
      const product = matchingProducts[0] || {
        id: `fallback-${req.category}`,
        name: `${req.category.charAt(0).toUpperCase() + req.category.slice(1)} Premium`,
        categoryName: req.category,
        basePrice: '500'
      };

      const quantity = Math.ceil(req.quantity * area);
      const unitPrice = parseFloat(product.basePrice) || 500;
      const totalPrice = quantity * unitPrice;

      // Generate price history
      const priceHistory: PricePoint[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        price: unitPrice * (0.9 + Math.random() * 0.2),
        source: Math.random() > 0.7 ? 'Market' : 'Supplier'
      }));

      // Generate alternative options
      const alternativeOptions: AlternativeOption[] = matchingProducts.slice(1, 4).map((altProduct, altIndex) => ({
        id: `alt-${altIndex}`,
        name: altProduct.name,
        supplier: `Supplier ${altIndex + 1}`,
        price: parseFloat(altProduct.basePrice) * (0.85 + Math.random() * 0.3),
        quality: 70 + Math.random() * 30,
        availability: ['in-stock', 'limited', 'out-of-stock'][Math.floor(Math.random() * 3)] as any,
        savingsPotential: Math.random() * 20
      }));

      return {
        id: `material-${index}`,
        productId: product.id,
        name: product.name,
        category: req.category,
        quantity,
        unit: req.unit,
        unitPrice,
        totalPrice,
        supplier: `Premium ${req.category} Supplier`,
        estimatedDelivery: new Date(Date.now() + (7 + Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
        priceHistory,
        marketTrend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)] as any,
        alternativeOptions,
        criticalPath: index < 3 // First 3 materials are on critical path
      };
    });
  };

  const generateBudgetAnalysis = (project: BudgetProject) => {
    const analysis: BudgetAnalysis = {
      totalCost: project.totalBudget,
      costBreakdown: {
        materials: project.materials.reduce((sum, m) => sum + m.totalPrice, 0),
        labor: project.laborCost,
        overhead: project.overheadCost,
        contingency: project.contingency
      },
      riskFactors: generateRiskFactors(project),
      optimizationOpportunities: generateOptimizationOpportunities(project),
      timeline: generateTimeline(project),
      costTrends: generateCostTrends(project)
    };

    setBudgetAnalysis(analysis);
  };

  const generateRiskFactors = (project: BudgetProject): RiskFactor[] => {
    return [
      {
        id: 'risk-1',
        type: 'price_volatility',
        severity: 'medium',
        impact: project.totalBudget * 0.05,
        description: 'Steel prices showing high volatility due to market conditions',
        mitigation: 'Consider forward contracts or bulk purchasing'
      },
      {
        id: 'risk-2',
        type: 'supply_shortage',
        severity: 'high',
        impact: project.totalBudget * 0.08,
        description: 'Potential cement shortage during peak construction season',
        mitigation: 'Secure supplier agreements and alternative sources'
      },
      {
        id: 'risk-3',
        type: 'timeline_delay',
        severity: 'low',
        impact: project.totalBudget * 0.03,
        description: 'Weather-related delays possible during monsoon season',
        mitigation: 'Build buffer time and weather-resistant planning'
      }
    ];
  };

  const generateOptimizationOpportunities = (project: BudgetProject): OptimizationOpportunity[] => {
    return [
      {
        id: 'opt-1',
        type: 'bulk_discount',
        potential_savings: project.totalBudget * 0.08,
        effort_level: 'medium',
        description: 'Bulk purchasing of cement and steel can yield 8-12% savings',
        action_required: 'Negotiate with suppliers for volume discounts'
      },
      {
        id: 'opt-2',
        type: 'alternative_material',
        potential_savings: project.totalBudget * 0.05,
        effort_level: 'low',
        description: 'Alternative brick suppliers offer similar quality at lower cost',
        action_required: 'Evaluate and test alternative suppliers'
      },
      {
        id: 'opt-3',
        type: 'timing_optimization',
        potential_savings: project.totalBudget * 0.04,
        effort_level: 'high',
        description: 'Off-season purchasing can reduce costs significantly',
        action_required: 'Adjust procurement timeline and storage planning'
      }
    ];
  };

  const generateTimeline = (project: BudgetProject): TimelinePhase[] => {
    const phases = ['Foundation', 'Structure', 'Roofing', 'Finishing'];
    const totalMonths = project.timeline;
    const monthsPerPhase = totalMonths / phases.length;

    return phases.map((phase, index) => ({
      phase,
      startDate: new Date(Date.now() + index * monthsPerPhase * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + (index + 1) * monthsPerPhase * 30 * 24 * 60 * 60 * 1000).toISOString(),
      cost: project.totalBudget / phases.length,
      materials: project.materials.slice(index * 2, (index + 1) * 2).map(m => m.name),
      dependencies: index > 0 ? [phases[index - 1]] : []
    }));
  };

  const generateCostTrends = (project: BudgetProject): CostTrend[] => {
    return project.materials.map(material => ({
      category: material.category,
      currentCost: material.totalPrice,
      projectedCost: material.totalPrice * (0.95 + Math.random() * 0.1),
      trend: material.marketTrend === 'rising' ? 'increasing' : 
             material.marketTrend === 'falling' ? 'decreasing' : 'stable',
      confidence: 70 + Math.random() * 25
    }));
  };

  const createProject = () => {
    if (newProject.name && newProject.area && newProject.location) {
      createProjectMutation.mutate(newProject);
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="w-full h-[700px] bg-white dark:bg-gray-900 rounded-lg border shadow-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator" data-testid="tab-calculator">
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="optimization" data-testid="tab-optimization">
            <Target className="h-4 w-4 mr-2" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="timeline" data-testid="tab-timeline">
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="h-[calc(100%-48px)] p-0">
          <div className="flex h-full">
            {/* Project Creation & List */}
            <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-800 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Create New Project</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Project name"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="project-name"
                    />
                    <Select value={newProject.type} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger data-testid="project-type">
                        <SelectValue placeholder="Project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Area (sq ft)"
                      type="number"
                      value={newProject.area}
                      onChange={(e) => setNewProject(prev => ({ ...prev, area: e.target.value }))}
                      data-testid="project-area"
                    />
                    <Input
                      placeholder="Location"
                      value={newProject.location}
                      onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                      data-testid="project-location"
                    />
                    <div>
                      <label className="text-sm font-medium">Timeline: {newProject.timeline} months</label>
                      <Slider
                        value={[newProject.timeline]}
                        onValueChange={([value]) => setNewProject(prev => ({ ...prev, timeline: value }))}
                        max={36}
                        min={3}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={createProject}
                      disabled={!newProject.name || !newProject.area || !newProject.location || isCalculating}
                      className="w-full"
                      data-testid="create-project"
                    >
                      {isCalculating ? 'Calculating...' : 'Calculate Budget'}
                    </Button>
                  </div>
                </div>

                {projects.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Your Projects</h3>
                    <div className="space-y-2">
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedProject === project.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedProject(project.id)}
                          data-testid={`project-${project.id}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{project.name}</h4>
                            <Badge className={`text-xs ${
                              project.status === 'active' ? 'bg-green-500' :
                              project.status === 'completed' ? 'bg-blue-500' : 'bg-orange-500'
                            }`}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>{project.area.toLocaleString()} sq ft</span>
                              <span>{project.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Budget:</span>
                              <span className="font-medium">₹{(project.totalBudget / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Timeline:</span>
                              <span>{project.timeline} months</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{Math.round((project.spentAmount / project.totalBudget) * 100)}%</span>
                            </div>
                            <Progress value={(project.spentAmount / project.totalBudget) * 100} className="h-2" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Details */}
            <div className="flex-1 p-4">
              {selectedProjectData ? (
                <div className="space-y-6">
                  {/* Project Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-600">Total Budget</div>
                            <div className="font-bold text-lg">₹{(selectedProjectData.totalBudget / 100000).toFixed(1)}L</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="text-sm text-gray-600">Materials Cost</div>
                            <div className="font-bold text-lg">₹{(selectedProjectData.materials.reduce((sum, m) => sum + m.totalPrice, 0) / 100000).toFixed(1)}L</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-orange-600" />
                          <div>
                            <div className="text-sm text-gray-600">Labor Cost</div>
                            <div className="font-bold text-lg">₹{(selectedProjectData.laborCost / 100000).toFixed(1)}L</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="text-sm text-gray-600">Timeline</div>
                            <div className="font-bold text-lg">{selectedProjectData.timeline}M</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Materials Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Materials Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProjectData.materials.map((material, index) => (
                          <motion.div
                            key={material.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{material.name}</h4>
                                {material.criticalPath && (
                                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                                )}
                                <Badge className={`text-xs ${
                                  material.marketTrend === 'rising' ? 'bg-red-500' :
                                  material.marketTrend === 'falling' ? 'bg-green-500' : 'bg-gray-500'
                                }`}>
                                  {material.marketTrend === 'rising' ? '↗' : material.marketTrend === 'falling' ? '↘' : '→'}
                                  {material.marketTrend}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {material.quantity.toLocaleString()} {material.unit} @ ₹{material.unitPrice.toLocaleString()}/{material.unit}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{material.totalPrice.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">{material.supplier}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: 'Materials', value: selectedProjectData.materials.reduce((sum, m) => sum + m.totalPrice, 0), color: 'bg-blue-500' },
                          { label: 'Labor', value: selectedProjectData.laborCost, color: 'bg-green-500' },
                          { label: 'Overhead', value: selectedProjectData.overheadCost, color: 'bg-orange-500' },
                          { label: 'Contingency', value: selectedProjectData.contingency, color: 'bg-purple-500' }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3">
                            <div className={`w-4 h-4 ${item.color} rounded`}></div>
                            <div className="flex-1 flex justify-between">
                              <span>{item.label}</span>
                              <span className="font-medium">₹{(item.value / 100000).toFixed(1)}L ({Math.round((item.value / selectedProjectData.totalBudget) * 100)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Create or select a project to view budget details
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="h-[calc(100%-48px)] p-4">
          {budgetAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {budgetAnalysis.riskFactors.map((risk) => (
                    <div key={risk.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={`text-xs ${
                          risk.severity === 'high' ? 'bg-red-500' :
                          risk.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>
                          {risk.severity} risk
                        </Badge>
                        <span className="font-medium">₹{(risk.impact / 100000).toFixed(1)}L</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                      <p className="text-xs text-blue-600">{risk.mitigation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Cost Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {budgetAnalysis.costTrends.map((trend) => (
                    <div key={trend.category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{trend.category}</h4>
                        <div className="text-sm text-gray-600">Confidence: {Math.round(trend.confidence)}%</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {trend.trend === 'increasing' ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : trend.trend === 'decreasing' ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 bg-gray-400 rounded"></div>
                          )}
                          <span className={`font-medium ${
                            trend.trend === 'increasing' ? 'text-red-600' :
                            trend.trend === 'decreasing' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {trend.trend}
                          </span>
                        </div>
                        <div className="text-sm">
                          ₹{(trend.currentCost / 100000).toFixed(1)}L → ₹{(trend.projectedCost / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a project to view detailed analysis
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="h-[calc(100%-48px)] p-4">
          {budgetAnalysis ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Potential Savings</div>
                        <div className="font-bold text-lg text-green-600">
                          ₹{(budgetAnalysis.optimizationOpportunities.reduce((sum, opt) => sum + opt.potential_savings, 0) / 100000).toFixed(1)}L
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
                          {budgetAnalysis.optimizationOpportunities.filter(opt => opt.effort_level === 'low').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-sm text-gray-600">Optimization %</div>
                        <div className="font-bold text-lg">
                          {Math.round((budgetAnalysis.optimizationOpportunities.reduce((sum, opt) => sum + opt.potential_savings, 0) / budgetAnalysis.totalCost) * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budgetAnalysis.optimizationOpportunities.map((opportunity) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            opportunity.effort_level === 'low' ? 'bg-green-500' :
                            opportunity.effort_level === 'medium' ? 'bg-orange-500' : 'bg-red-500'
                          }`}>
                            {opportunity.effort_level} effort
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {opportunity.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">₹{(opportunity.potential_savings / 100000).toFixed(1)}L</div>
                          <div className="text-xs text-gray-600">potential savings</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{opportunity.description}</p>
                      <p className="text-xs text-blue-600">{opportunity.action_required}</p>
                      <Button variant="outline" size="sm" className="mt-3" data-testid={`implement-${opportunity.id}`}>
                        Implement Optimization
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a project to view optimization opportunities
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="h-[calc(100%-48px)] p-4">
          {budgetAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline & Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetAnalysis.timeline.map((phase, index) => (
                    <motion.div
                      key={phase.phase}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{phase.phase}</h4>
                          <div className="text-sm text-gray-600">
                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{(phase.cost / 100000).toFixed(1)}L</div>
                          <div className="text-xs text-gray-600">
                            {Math.round((phase.cost / budgetAnalysis.totalCost) * 100)}% of total
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-medium mb-1">Key Materials:</div>
                          <div className="flex flex-wrap gap-1">
                            {phase.materials.map(material => (
                              <Badge key={material} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {phase.dependencies.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-1">Dependencies:</div>
                            <div className="flex flex-wrap gap-1">
                              {phase.dependencies.map(dep => (
                                <Badge key={dep} variant="secondary" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <Progress value={(index + 1) * 25} className="h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a project to view timeline breakdown
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}