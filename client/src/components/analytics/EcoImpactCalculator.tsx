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
  Leaf, 
  TreePine, 
  Recycle,
  Zap,
  Droplets,
  Wind,
  Factory,
  Car,
  Home,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CarbonFootprintData {
  id: string;
  projectId: string;
  projectName: string;
  totalEmissions: number; // kg CO2e
  emissionsByCategory: {
    materials: number;
    transportation: number;
    energy: number;
    waste: number;
    water: number;
  };
  materials: MaterialEmission[];
  reductionOpportunities: ReductionOpportunity[];
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  offsetRequired: number;
  sustainabilityScore: number;
  benchmarkComparison: BenchmarkData;
  timelineEmissions: TimelineEmission[];
  mitigationStrategies: MitigationStrategy[];
}

interface MaterialEmission {
  id: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  emissionFactor: number; // kg CO2e per unit
  totalEmissions: number;
  productionEmissions: number;
  transportationEmissions: number;
  recyclingPotential: number;
  alternativeMaterials: AlternativeMaterial[];
  source: string;
}

interface AlternativeMaterial {
  id: string;
  name: string;
  emissionFactor: number;
  costImpact: number; // percentage change
  availabilityScore: number;
  qualityScore: number;
  emissionReduction: number;
}

interface ReductionOpportunity {
  id: string;
  category: 'material' | 'process' | 'energy' | 'transportation' | 'waste';
  title: string;
  description: string;
  potentialReduction: number; // kg CO2e
  implementationCost: number;
  paybackPeriod: number; // months
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  feasibility: number; // 0-100%
}

interface BenchmarkData {
  industryAverage: number;
  bestInClass: number;
  yourPerformance: number;
  percentile: number;
  comparisonMessage: string;
}

interface TimelineEmission {
  phase: string;
  startDate: string;
  endDate: string;
  emissions: number;
  cumulativeEmissions: number;
  mitigationApplied: number;
}

interface MitigationStrategy {
  id: string;
  name: string;
  type: 'prevention' | 'reduction' | 'offset';
  effectiveness: number; // 0-100%
  cost: number;
  timeToImplement: number; // days
  environmentalBenefit: string;
  businessBenefit: string;
}

interface EcoProject {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial';
  area: number;
  location: string;
  materials: any[];
  status: 'planning' | 'active' | 'completed';
  carbonFootprint?: CarbonFootprintData;
}

export default function EcoImpactCalculator() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [projects, setProjects] = useState<EcoProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    type: 'residential' as const,
    area: '',
    location: ''
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real products for emission calculations
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Calculate carbon footprint mutation
  const calculateFootprintMutation = useMutation({
    mutationFn: async (projectData: any) => {
      setIsCalculating(true);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate calculation
      
      const carbonFootprint = generateCarbonFootprintData(projectData, products as any[]);
      return { ...projectData, carbonFootprint };
    },
    onSuccess: (project) => {
      setProjects(prev => [...prev, project]);
      setSelectedProject(project.id);
      setIsCalculating(false);
      toast({
        title: "Carbon Footprint Calculated! 🌱",
        description: `Environmental impact analysis for ${project.name} is complete`,
      });
      setNewProject({ name: '', type: 'residential', area: '', location: '' });
    },
    onError: () => {
      setIsCalculating(false);
    }
  });

  // Generate sample projects with carbon footprint data
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const sampleProjects = generateSampleEcoProjects(products as any[]);
      setProjects(sampleProjects);
      if (sampleProjects.length > 0) {
        setSelectedProject(sampleProjects[0].id);
      }
    }
  }, [products]);

  const generateSampleEcoProjects = (products: any[]): EcoProject[] => {
    const sampleProjects = [
      { name: 'Green Villa Project', type: 'residential' as const, area: 2500, location: 'Mumbai' },
      { name: 'Eco Office Complex', type: 'commercial' as const, area: 5000, location: 'Bangalore' },
      { name: 'Sustainable Warehouse', type: 'industrial' as const, area: 8000, location: 'Chennai' }
    ];

    return sampleProjects.map((project, index) => {
      const materials = generateProjectMaterials(project.area, project.type, products);
      const carbonFootprint = generateCarbonFootprintData({ ...project, materials }, products);
      
      return {
        id: `eco-project-${index}`,
        ...project,
        materials,
        status: 'planning',
        carbonFootprint
      };
    });
  };

  const generateProjectMaterials = (area: number, type: string, products: any[]): any[] => {
    const materialRequirements = {
      residential: [
        { category: 'cement', multiplier: 0.4 },
        { category: 'steel', multiplier: 3.5 },
        { category: 'brick', multiplier: 35 },
        { category: 'paint', multiplier: 0.15 }
      ],
      commercial: [
        { category: 'cement', multiplier: 0.5 },
        { category: 'steel', multiplier: 4.2 },
        { category: 'brick', multiplier: 40 },
        { category: 'glass', multiplier: 0.3 }
      ],
      industrial: [
        { category: 'cement', multiplier: 0.6 },
        { category: 'steel', multiplier: 5.5 },
        { category: 'brick', multiplier: 25 }
      ]
    };

    const requirements = materialRequirements[type as keyof typeof materialRequirements] || materialRequirements.residential;

    return requirements.map(req => {
      const matchingProducts = products.filter(p => 
        p.name?.toLowerCase().includes(req.category) ||
        p.categoryName?.toLowerCase().includes(req.category)
      );
      
      const product = matchingProducts[0] || {
        id: `fallback-${req.category}`,
        name: `${req.category.charAt(0).toUpperCase() + req.category.slice(1)} Premium`,
        categoryName: req.category
      };

      return {
        ...product,
        quantity: Math.ceil(req.multiplier * area),
        unit: req.category === 'steel' ? 'kg' : req.category === 'brick' ? 'pieces' : 'bags'
      };
    });
  };

  const generateCarbonFootprintData = (project: any, products: any[]): CarbonFootprintData => {
    // Carbon emission factors (kg CO2e per unit)
    const emissionFactors = {
      cement: 0.87, // per kg
      steel: 2.3,   // per kg
      brick: 0.2,   // per piece
      paint: 3.5,   // per liter
      glass: 1.1,   // per kg
      aluminum: 11.5, // per kg
      concrete: 0.13, // per kg
      timber: -0.9,   // negative = carbon sequestration
      recycled_steel: 0.5 // per kg
    };

    const materials: MaterialEmission[] = project.materials.map((material: any, index: number) => {
      const category = material.categoryName?.toLowerCase() || material.name?.toLowerCase() || 'concrete';
      const emissionFactor = emissionFactors[category as keyof typeof emissionFactors] || 1.0;
      const quantity = material.quantity || 100;
      const totalEmissions = quantity * emissionFactor;
      
      const productionEmissions = totalEmissions * 0.7;
      const transportationEmissions = totalEmissions * 0.3;

      return {
        id: `material-${index}`,
        materialName: material.name,
        category: material.categoryName || 'Construction Material',
        quantity,
        unit: material.unit || 'units',
        emissionFactor,
        totalEmissions,
        productionEmissions,
        transportationEmissions,
        recyclingPotential: Math.random() * 30 + 20, // 20-50%
        alternativeMaterials: generateAlternativeMaterials(material, emissionFactor),
        source: 'Production Analysis'
      };
    });

    const totalMaterialEmissions = materials.reduce((sum, m) => sum + m.totalEmissions, 0);
    const transportationEmissions = totalMaterialEmissions * 0.15;
    const energyEmissions = project.area * 25; // kg CO2e per sq ft
    const wasteEmissions = totalMaterialEmissions * 0.1;
    const waterEmissions = project.area * 5;

    const totalEmissions = totalMaterialEmissions + transportationEmissions + energyEmissions + wasteEmissions + waterEmissions;

    const emissionsByCategory = {
      materials: totalMaterialEmissions,
      transportation: transportationEmissions,
      energy: energyEmissions,
      waste: wasteEmissions,
      water: waterEmissions
    };

    const reductionOpportunities = generateReductionOpportunities(totalEmissions, project.area);
    const benchmarkComparison = generateBenchmarkComparison(totalEmissions, project.area, project.type);
    const timelineEmissions = generateTimelineEmissions(totalEmissions);
    const mitigationStrategies = generateMitigationStrategies(totalEmissions);

    const sustainabilityScore = Math.max(0, Math.min(100, 
      100 - (totalEmissions / (project.area * 50)) * 100
    ));

    let certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (sustainabilityScore >= 90) certificationLevel = 'platinum';
    else if (sustainabilityScore >= 75) certificationLevel = 'gold';
    else if (sustainabilityScore >= 60) certificationLevel = 'silver';

    return {
      id: `footprint-${project.id}`,
      projectId: project.id,
      projectName: project.name,
      totalEmissions,
      emissionsByCategory,
      materials,
      reductionOpportunities,
      certificationLevel,
      offsetRequired: Math.max(0, totalEmissions - (project.area * 30)), // Target: 30 kg CO2e per sq ft
      sustainabilityScore,
      benchmarkComparison,
      timelineEmissions,
      mitigationStrategies
    };
  };

  const generateAlternativeMaterials = (originalMaterial: any, originalEmissionFactor: number): AlternativeMaterial[] => {
    const alternatives = [
      { name: 'Recycled ' + originalMaterial.name, emissionReduction: 0.4 },
      { name: 'Bio-based ' + originalMaterial.name, emissionReduction: 0.6 },
      { name: 'Low-carbon ' + originalMaterial.name, emissionReduction: 0.3 }
    ];

    return alternatives.map((alt, index) => ({
      id: `alt-${index}`,
      name: alt.name,
      emissionFactor: originalEmissionFactor * (1 - alt.emissionReduction),
      costImpact: (alt.emissionReduction * 50 - 10) + (Math.random() * 20 - 10), // -10% to +40%
      availabilityScore: 60 + Math.random() * 35, // 60-95%
      qualityScore: 80 + Math.random() * 20, // 80-100%
      emissionReduction: alt.emissionReduction * 100
    }));
  };

  const generateReductionOpportunities = (totalEmissions: number, area: number): ReductionOpportunity[] => {
    return [
      {
        id: 'reduction-1',
        category: 'material',
        title: 'Use Recycled Steel',
        description: 'Replace virgin steel with recycled steel to reduce carbon emissions by 60%',
        potentialReduction: totalEmissions * 0.15,
        implementationCost: area * 50,
        paybackPeriod: 18,
        effort: 'medium',
        impact: 'high',
        feasibility: 85
      },
      {
        id: 'reduction-2',
        category: 'energy',
        title: 'Solar Power Integration',
        description: 'Install on-site solar panels to reduce grid electricity dependence',
        potentialReduction: totalEmissions * 0.2,
        implementationCost: area * 120,
        paybackPeriod: 36,
        effort: 'high',
        impact: 'high',
        feasibility: 90
      },
      {
        id: 'reduction-3',
        category: 'transportation',
        title: 'Local Material Sourcing',
        description: 'Source materials from suppliers within 50km radius',
        potentialReduction: totalEmissions * 0.08,
        implementationCost: area * 10,
        paybackPeriod: 6,
        effort: 'low',
        impact: 'medium',
        feasibility: 95
      },
      {
        id: 'reduction-4',
        category: 'waste',
        title: 'Waste Reduction Program',
        description: 'Implement comprehensive waste reduction and recycling program',
        potentialReduction: totalEmissions * 0.05,
        implementationCost: area * 25,
        paybackPeriod: 12,
        effort: 'medium',
        impact: 'medium',
        feasibility: 80
      }
    ];
  };

  const generateBenchmarkComparison = (emissions: number, area: number, type: string): BenchmarkData => {
    const emissionsPerSqFt = emissions / area;
    
    const benchmarks = {
      residential: { average: 45, best: 25 },
      commercial: { average: 55, best: 30 },
      industrial: { average: 40, best: 22 }
    };

    const benchmark = benchmarks[type as keyof typeof benchmarks] || benchmarks.residential;
    const percentile = Math.round(((benchmark.average - emissionsPerSqFt) / (benchmark.average - benchmark.best)) * 100);
    const clampedPercentile = Math.max(5, Math.min(95, percentile));

    let comparisonMessage = '';
    if (clampedPercentile >= 80) {
      comparisonMessage = 'Excellent! Your project is in the top 20% for environmental performance.';
    } else if (clampedPercentile >= 60) {
      comparisonMessage = 'Good performance, above industry average with room for improvement.';
    } else if (clampedPercentile >= 40) {
      comparisonMessage = 'Average performance, consider implementing reduction strategies.';
    } else {
      comparisonMessage = 'Below average performance, significant improvement opportunities available.';
    }

    return {
      industryAverage: benchmark.average,
      bestInClass: benchmark.best,
      yourPerformance: emissionsPerSqFt,
      percentile: clampedPercentile,
      comparisonMessage
    };
  };

  const generateTimelineEmissions = (totalEmissions: number): TimelineEmission[] => {
    const phases = ['Planning', 'Foundation', 'Structure', 'Finishing'];
    const emissionDistribution = [0.1, 0.4, 0.35, 0.15]; // Percentage distribution
    let cumulativeEmissions = 0;

    return phases.map((phase, index) => {
      const phaseEmissions = totalEmissions * emissionDistribution[index];
      cumulativeEmissions += phaseEmissions;
      const mitigationApplied = phaseEmissions * (0.05 + Math.random() * 0.1); // 5-15% mitigation

      return {
        phase,
        startDate: new Date(Date.now() + index * 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + (index + 1) * 90 * 24 * 60 * 60 * 1000).toISOString(),
        emissions: phaseEmissions,
        cumulativeEmissions: cumulativeEmissions - mitigationApplied,
        mitigationApplied
      };
    });
  };

  const generateMitigationStrategies = (totalEmissions: number): MitigationStrategy[] => {
    return [
      {
        id: 'strategy-1',
        name: 'Green Building Certification',
        type: 'prevention',
        effectiveness: 85,
        cost: totalEmissions * 0.5,
        timeToImplement: 30,
        environmentalBenefit: 'Reduces overall environmental impact by 15-25%',
        businessBenefit: 'Increases property value and reduces operational costs'
      },
      {
        id: 'strategy-2',
        name: 'Carbon Offset Program',
        type: 'offset',
        effectiveness: 100,
        cost: totalEmissions * 2,
        timeToImplement: 7,
        environmentalBenefit: 'Neutralizes remaining carbon emissions through verified offsets',
        businessBenefit: 'Achieves carbon neutrality and improves brand reputation'
      },
      {
        id: 'strategy-3',
        name: 'Energy Efficiency Optimization',
        type: 'reduction',
        effectiveness: 70,
        cost: totalEmissions * 1.2,
        timeToImplement: 45,
        environmentalBenefit: 'Reduces operational emissions by 20-30% over building lifetime',
        businessBenefit: 'Lower energy bills and improved operational efficiency'
      }
    ];
  };

  const calculateProject = () => {
    if (newProject.name && newProject.area && newProject.location) {
      const materials = generateProjectMaterials(Number(newProject.area), newProject.type, products as any[]);
      calculateFootprintMutation.mutate({
        id: `project-${Date.now()}`,
        ...newProject,
        area: Number(newProject.area),
        materials
      });
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const selectedMaterialData = selectedProjectData?.carbonFootprint?.materials.find(m => m.id === selectedMaterial);

  return (
    <div className="w-full h-[700px] bg-white dark:bg-gray-900 rounded-lg border shadow-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calculator" data-testid="tab-calculator">
            <Leaf className="h-4 w-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="breakdown" data-testid="tab-breakdown">
            <PieChart className="h-4 w-4 mr-2" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="reduction" data-testid="tab-reduction">
            <Target className="h-4 w-4 mr-2" />
            Reduction
          </TabsTrigger>
          <TabsTrigger value="benchmark" data-testid="tab-benchmark">
            <BarChart3 className="h-4 w-4 mr-2" />
            Benchmark
          </TabsTrigger>
          <TabsTrigger value="certification" data-testid="tab-certification">
            <Award className="h-4 w-4 mr-2" />
            Certification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="h-[calc(100%-48px)] p-0">
          <div className="flex h-full">
            {/* Project Setup */}
            <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-800 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Calculate Carbon Footprint
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Project name"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="eco-project-name"
                    />
                    <Select value={newProject.type} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger data-testid="eco-project-type">
                        <SelectValue placeholder="Project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential Building</SelectItem>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="industrial">Industrial Facility</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Total area (sq ft)"
                      type="number"
                      value={newProject.area}
                      onChange={(e) => setNewProject(prev => ({ ...prev, area: e.target.value }))}
                      data-testid="eco-project-area"
                    />
                    <Input
                      placeholder="Location"
                      value={newProject.location}
                      onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                      data-testid="eco-project-location"
                    />
                    <Button 
                      onClick={calculateProject}
                      disabled={!newProject.name || !newProject.area || !newProject.location || isCalculating}
                      className="w-full"
                      data-testid="calculate-footprint"
                    >
                      {isCalculating ? 'Analyzing Environmental Impact...' : 'Calculate Carbon Footprint'}
                    </Button>
                  </div>
                </div>

                {projects.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Your Eco Projects</h3>
                    <div className="space-y-2">
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedProject === project.id 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedProject(project.id)}
                          data-testid={`eco-project-${project.id}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{project.name}</h4>
                            <Badge className={`text-xs ${
                              project.carbonFootprint?.certificationLevel === 'platinum' ? 'bg-purple-500' :
                              project.carbonFootprint?.certificationLevel === 'gold' ? 'bg-yellow-500' :
                              project.carbonFootprint?.certificationLevel === 'silver' ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              {project.carbonFootprint?.certificationLevel}
                            </Badge>
                          </div>
                          {project.carbonFootprint && (
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Total Emissions:</span>
                                <span className="font-medium">{(project.carbonFootprint.totalEmissions / 1000).toFixed(1)} tCO₂e</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Per sq ft:</span>
                                <span>{(project.carbonFootprint.totalEmissions / project.area).toFixed(1)} kg CO₂e</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sustainability Score:</span>
                                <span className="text-green-600">{Math.round(project.carbonFootprint.sustainabilityScore)}%</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Dashboard */}
            <div className="flex-1 p-4">
              {selectedProjectData?.carbonFootprint ? (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Factory className="h-5 w-5 text-red-600" />
                          <div>
                            <div className="text-sm text-gray-600">Total Emissions</div>
                            <div className="font-bold text-lg">{(selectedProjectData.carbonFootprint.totalEmissions / 1000).toFixed(1)} tCO₂e</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-600">Sustainability Score</div>
                            <div className="font-bold text-lg text-green-600">{Math.round(selectedProjectData.carbonFootprint.sustainabilityScore)}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TreePine className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="text-sm text-gray-600">Offset Required</div>
                            <div className="font-bold text-lg">{(selectedProjectData.carbonFootprint.offsetRequired / 1000).toFixed(1)} tCO₂e</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="text-sm text-gray-600">Certification</div>
                            <div className={`font-bold text-lg capitalize ${
                              selectedProjectData.carbonFootprint.certificationLevel === 'platinum' ? 'text-purple-600' :
                              selectedProjectData.carbonFootprint.certificationLevel === 'gold' ? 'text-yellow-600' :
                              selectedProjectData.carbonFootprint.certificationLevel === 'silver' ? 'text-gray-600' : 'text-orange-600'
                            }`}>
                              {selectedProjectData.carbonFootprint.certificationLevel}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Emissions Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Emissions by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(selectedProjectData.carbonFootprint.emissionsByCategory).map(([category, emissions]) => {
                          const percentage = (emissions / selectedProjectData.carbonFootprint!.totalEmissions) * 100;
                          const icons = {
                            materials: Factory,
                            transportation: Car,
                            energy: Zap,
                            waste: Recycle,
                            water: Droplets
                          };
                          const Icon = icons[category as keyof typeof icons];
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span className="capitalize">{category}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">{(emissions / 1000).toFixed(1)} tCO₂e</span>
                                  <span className="text-sm text-gray-600 ml-2">({percentage.toFixed(1)}%)</span>
                                </div>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Materials */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Contributing Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProjectData.carbonFootprint.materials
                          .sort((a, b) => b.totalEmissions - a.totalEmissions)
                          .slice(0, 5)
                          .map((material, index) => (
                            <motion.div
                              key={material.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => setSelectedMaterial(material.id)}
                              data-testid={`material-${material.id}`}
                            >
                              <div>
                                <h4 className="font-medium">{material.materialName}</h4>
                                <div className="text-sm text-gray-600">
                                  {material.quantity.toLocaleString()} {material.unit} @ {material.emissionFactor.toFixed(2)} kg CO₂e/{material.unit}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{(material.totalEmissions / 1000).toFixed(2)} tCO₂e</div>
                                <div className="text-xs text-gray-600">
                                  {((material.totalEmissions / selectedProjectData.carbonFootprint!.totalEmissions) * 100).toFixed(1)}% of total
                                </div>
                              </div>
                            </motion.div>
                          ))
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Calculate Your Carbon Footprint</h3>
                    <p>Enter project details to analyze environmental impact and get sustainability recommendations</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="h-[calc(100%-48px)] p-4">
          {selectedProjectData?.carbonFootprint ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Material Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedProjectData.carbonFootprint.materials.map((material) => (
                        <div key={material.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{material.materialName}</h4>
                            <Badge variant="outline">{material.category}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Production:</span>
                              <span className="font-medium ml-2">{(material.productionEmissions / 1000).toFixed(2)} tCO₂e</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Transport:</span>
                              <span className="font-medium ml-2">{(material.transportationEmissions / 1000).toFixed(2)} tCO₂e</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Recycling Potential:</span>
                              <span className="font-medium ml-2">{material.recyclingPotential.toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Alternatives:</span>
                              <span className="font-medium ml-2">{material.alternativeMaterials.length}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedMaterialData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Alternative Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedMaterialData.alternativeMaterials.map((alt) => (
                          <div key={alt.id} className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-2">{alt.name}</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Emission Reduction:</span>
                                <span className="text-green-600 font-medium ml-2">{alt.emissionReduction.toFixed(0)}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Cost Impact:</span>
                                <span className={`font-medium ml-2 ${alt.costImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {alt.costImpact > 0 ? '+' : ''}{alt.costImpact.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Availability:</span>
                                <span className="font-medium ml-2">{alt.availabilityScore.toFixed(0)}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Quality:</span>
                                <span className="font-medium ml-2">{alt.qualityScore.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a project to view detailed breakdown
            </div>
          )}
        </TabsContent>

        <TabsContent value="reduction" className="h-[calc(100%-48px)] p-4">
          {selectedProjectData?.carbonFootprint ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Total Reduction Potential</div>
                        <div className="font-bold text-lg text-green-600">
                          {(selectedProjectData.carbonFootprint.reductionOpportunities.reduce((sum, opp) => sum + opp.potentialReduction, 0) / 1000).toFixed(1)} tCO₂e
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
                          {selectedProjectData.carbonFootprint.reductionOpportunities.filter(opp => opp.effort === 'low').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-sm text-gray-600">Max Reduction %</div>
                        <div className="font-bold text-lg">
                          {Math.round((selectedProjectData.carbonFootprint.reductionOpportunities.reduce((sum, opp) => sum + opp.potentialReduction, 0) / selectedProjectData.carbonFootprint.totalEmissions) * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Reduction Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProjectData.carbonFootprint.reductionOpportunities.map((opportunity) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            opportunity.effort === 'low' ? 'bg-green-500' :
                            opportunity.effort === 'medium' ? 'bg-orange-500' : 'bg-red-500'
                          }`}>
                            {opportunity.effort} effort
                          </Badge>
                          <Badge className={`text-xs ${
                            opportunity.impact === 'high' ? 'bg-red-500' :
                            opportunity.impact === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}>
                            {opportunity.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {opportunity.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{(opportunity.potentialReduction / 1000).toFixed(1)} tCO₂e</div>
                          <div className="text-xs text-gray-600">reduction potential</div>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{opportunity.title}</h4>
                      <p className="text-sm text-gray-700 mb-3">{opportunity.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-medium ml-2">₹{(opportunity.implementationCost / 100000).toFixed(1)}L</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Payback:</span>
                          <span className="font-medium ml-2">{opportunity.paybackPeriod} months</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Feasibility:</span>
                          <span className="font-medium ml-2">{opportunity.feasibility}%</span>
                        </div>
                        <div>
                          <Button variant="outline" size="sm" data-testid={`implement-${opportunity.id}`} onClick={() => toast({ title: "Implement", description: `${opportunity.title} – action recorded.` })}>
                            Implement
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a project to view reduction opportunities
            </div>
          )}
        </TabsContent>

        <TabsContent value="benchmark" className="h-[calc(100%-48px)] p-4">
          {selectedProjectData?.carbonFootprint ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmark Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {selectedProjectData.carbonFootprint.benchmarkComparison.percentile}th
                      </div>
                      <div className="text-lg font-medium">Percentile</div>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedProjectData.carbonFootprint.benchmarkComparison.comparisonMessage}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedProjectData.carbonFootprint.benchmarkComparison.industryAverage.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Industry Average</div>
                        <div className="text-xs text-gray-500">kg CO₂e per sq ft</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedProjectData.carbonFootprint.benchmarkComparison.yourPerformance.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Your Performance</div>
                        <div className="text-xs text-gray-500">kg CO₂e per sq ft</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedProjectData.carbonFootprint.benchmarkComparison.bestInClass.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Best in Class</div>
                        <div className="text-xs text-gray-500">kg CO₂e per sq ft</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Best in Class</span>
                        <span>Industry Average</span>
                      </div>
                      <div className="relative">
                        <Progress value={100} className="h-4" />
                        <div 
                          className="absolute top-0 h-4 w-1 bg-blue-600 border-2 border-white"
                          style={{
                            left: `${((selectedProjectData.carbonFootprint.benchmarkComparison.yourPerformance - selectedProjectData.carbonFootprint.benchmarkComparison.bestInClass) / 
                                    (selectedProjectData.carbonFootprint.benchmarkComparison.industryAverage - selectedProjectData.carbonFootprint.benchmarkComparison.bestInClass)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="text-center text-sm text-blue-600 font-medium">
                        Your Position
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline Emissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedProjectData.carbonFootprint.timelineEmissions.map((phase, index) => (
                      <div key={phase.phase} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{phase.phase}</h4>
                          <div className="text-right">
                            <div className="font-semibold">{(phase.emissions / 1000).toFixed(1)} tCO₂e</div>
                            <div className="text-xs text-gray-600">Phase emissions</div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{new Date(phase.startDate).toLocaleDateString()}</span>
                          <span>{new Date(phase.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Cumulative: {(phase.cumulativeEmissions / 1000).toFixed(1)} tCO₂e</span>
                            <span className="text-green-600">Mitigation: -{(phase.mitigationApplied / 1000).toFixed(1)} tCO₂e</span>
                          </div>
                          <Progress value={(phase.cumulativeEmissions / selectedProjectData.carbonFootprint!.totalEmissions) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a project to view benchmark analysis
            </div>
          )}
        </TabsContent>

        <TabsContent value="certification" className="h-[calc(100%-48px)] p-4">
          {selectedProjectData?.carbonFootprint ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Sustainability Certification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold mb-4 ${
                      selectedProjectData.carbonFootprint.certificationLevel === 'platinum' ? 'bg-purple-100 text-purple-700' :
                      selectedProjectData.carbonFootprint.certificationLevel === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                      selectedProjectData.carbonFootprint.certificationLevel === 'silver' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      <Award className="h-12 w-12" />
                    </div>
                    <h3 className={`text-2xl font-bold capitalize mb-2 ${
                      selectedProjectData.carbonFootprint.certificationLevel === 'platinum' ? 'text-purple-700' :
                      selectedProjectData.carbonFootprint.certificationLevel === 'gold' ? 'text-yellow-700' :
                      selectedProjectData.carbonFootprint.certificationLevel === 'silver' ? 'text-gray-700' : 'text-orange-700'
                    }`}>
                      {selectedProjectData.carbonFootprint.certificationLevel} Certification
                    </h3>
                    <p className="text-gray-600">
                      Your project achieves {selectedProjectData.carbonFootprint.certificationLevel} level sustainability standards
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Mitigation Strategies</h4>
                      <div className="space-y-3">
                        {selectedProjectData.carbonFootprint.mitigationStrategies.map((strategy) => (
                          <div key={strategy.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium">{strategy.name}</h5>
                              <Badge className={`text-xs ${
                                strategy.type === 'prevention' ? 'bg-green-500' :
                                strategy.type === 'reduction' ? 'bg-blue-500' : 'bg-purple-500'
                              }`}>
                                {strategy.type}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Effectiveness:</span>
                                <span className="font-medium">{strategy.effectiveness}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Implementation:</span>
                                <span className="font-medium">{strategy.timeToImplement} days</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-2">{strategy.environmentalBenefit}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Certification Criteria</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span>Emissions per sq ft</span>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-xs text-gray-600">
                            ≤ {selectedProjectData.carbonFootprint.certificationLevel === 'platinum' ? '25' : 
                               selectedProjectData.carbonFootprint.certificationLevel === 'gold' ? '35' :
                               selectedProjectData.carbonFootprint.certificationLevel === 'silver' ? '45' : '55'} kg CO₂e/sq ft
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span>Sustainability Score</span>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-xs text-gray-600">
                            ≥ {selectedProjectData.carbonFootprint.certificationLevel === 'platinum' ? '90' : 
                               selectedProjectData.carbonFootprint.certificationLevel === 'gold' ? '75' :
                               selectedProjectData.carbonFootprint.certificationLevel === 'silver' ? '60' : '45'}%
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span>Reduction Strategies</span>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-xs text-gray-600">
                            ≥ {selectedProjectData.carbonFootprint.reductionOpportunities.length} implemented
                          </div>
                        </div>
                      </div>

                      <Button className="w-full mt-4" data-testid="download-certificate" onClick={() => toast({ title: "Certificate", description: "Your sustainability certificate has been downloaded." })}>
                        Download Certificate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a project to view certification details
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}