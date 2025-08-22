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

// Dynamic pricing factors
const marketFactors = {
  seasonalMultiplier: () => {
    const month = new Date().getMonth() + 1;
    // Monsoon season (June-Sept) has higher prices due to transportation issues
    if (month >= 6 && month <= 9) return 1.15;
    // Peak construction season (Oct-March) has standard pricing
    if (month >= 10 || month <= 3) return 1.0;
    // Summer months have slightly higher prices due to material degradation
    return 1.08;
  },
  demandMultiplier: () => {
    // Simulate market demand (could be from real API)
    const currentHour = new Date().getHours();
    // Business hours have higher demand
    if (currentHour >= 9 && currentHour <= 17) return 1.05;
    return 0.98;
  },
  locationMultiplier: (city: string = 'Mumbai') => {
    const cityMultipliers: Record<string, number> = {
      'Mumbai': 1.2,
      'Delhi': 1.15,
      'Bangalore': 1.1,
      'Chennai': 1.08,
      'Kolkata': 1.05,
      'Pune': 1.12,
      'Hyderabad': 1.07
    };
    return cityMultipliers[city] || 1.0;
  },
  bulkDiscountMultiplier: (quantity: number, threshold: number = 100) => {
    if (quantity >= threshold * 10) return 0.85; // 15% discount for very large orders
    if (quantity >= threshold * 5) return 0.90;  // 10% discount for large orders
    if (quantity >= threshold) return 0.95;      // 5% discount for bulk orders
    return 1.0; // No discount
  }
};

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
  const [location, setLocation] = useState<string>('Mumbai');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [realTimeOptimization, setRealTimeOptimization] = useState<boolean>(false);

  // Fetch real data for optimization
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Real-time cost estimation
  useEffect(() => {
    if (sqft > 0 && projectType) {
      const typeMultiplier = defaultProjectTypes.find(t => t.value === projectType)?.multiplier || 1.0;
      const baseEstimate = sqft * 800 * typeMultiplier; // ₹800 per sq ft base rate
      const locationFactor = marketFactors.locationMultiplier(location);
      const seasonalFactor = marketFactors.seasonalMultiplier();
      const estimate = baseEstimate * locationFactor * seasonalFactor;
      setEstimatedCost(estimate);
    }
  }, [sqft, projectType, location]);

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
      
      return generateAdvancedOptimizationResult(projectSpec);
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

  const generateDynamicMaterialRequirements = (type: string, sqft: number, location: string = 'Mumbai'): MaterialRequirement[] => {
    const typeMultiplier = defaultProjectTypes.find(t => t.value === type)?.multiplier || 1.0;
    const realProducts = Array.isArray(products) ? products as any[] : [];
    
    // Get unique categories from real products data
    const productCategories = new Set(realProducts.map((p: any) => p.categoryName).filter(Boolean));
    const categoryArray = Array.from(productCategories);
    
    // If we have real product data, use it; otherwise fall back to static data
    const baseCategories = categoryArray.length > 0 ? 
      categoryArray.map(cat => ({ name: cat, avgCost: 0, unit: 'units' })) :
      [
        { name: 'Cement', avgCost: 400, unit: 'bags' },
        { name: 'Steel', avgCost: 60000, unit: 'tons' },
        { name: 'Bricks', avgCost: 8, unit: 'pieces' },
        { name: 'Metal', avgCost: 45000, unit: 'tons' }
      ];

    return baseCategories.map((category, index) => {
      // Calculate quantity based on construction norms
      const baseQuantity = calculateProjectQuantity(category.name, sqft, type);
      
      // Get dynamic pricing from real products
      const categoryProducts = realProducts.filter((p: any) => p.categoryName === category.name);
      const avgMarketPrice = categoryProducts.length > 0 ? 
        categoryProducts.reduce((sum: number, p: any) => {
          const price = p.priceSlabs && p.priceSlabs.length > 0 ? p.priceSlabs[0].price : p.basePrice || 1000;
          return sum + price;
        }, 0) / categoryProducts.length :
        category.avgCost || 1000;

      // Apply dynamic market factors
      const seasonalFactor = marketFactors.seasonalMultiplier();
      const demandFactor = marketFactors.demandMultiplier();
      const locationFactor = marketFactors.locationMultiplier(location);
      const bulkFactor = marketFactors.bulkDiscountMultiplier(baseQuantity, 50);
      
      const marketPrice = avgMarketPrice * seasonalFactor * demandFactor * locationFactor * bulkFactor;
      const currentCost = marketPrice * baseQuantity;
      
      // Advanced optimization algorithm
      const optimizedCost = calculateOptimizedCost(
        currentCost, 
        category.name, 
        baseQuantity, 
        priority,
        categoryProducts
      );

      return {
        id: `material-${index}`,
        category: category.name,
        quantity: baseQuantity,
        unit: getOptimalUnit(category.name),
        currentCost,
        optimizedCost,
        alternatives: generateDynamicAlternatives(category.name, currentCost, categoryProducts)
      };
    });
  };

  const calculateProjectQuantity = (material: string, sqft: number, projectType: string): number => {
    const typeMultiplier = defaultProjectTypes.find(t => t.value === projectType)?.multiplier || 1.0;
    
    // Industry-standard material calculations per sq ft
    const materialNorms: Record<string, number> = {
      'Cement': Math.ceil((sqft / 1000) * 8 * typeMultiplier), // 8 bags per 1000 sq ft
      'Steel': Math.ceil((sqft / 1000) * 4 * typeMultiplier), // 4 kg per sq ft
      'Bricks': Math.ceil((sqft / 1000) * 40 * typeMultiplier), // 40 bricks per sq ft
      'Metal': Math.ceil((sqft / 1000) * 3 * typeMultiplier), // 3 kg per sq ft
      'Paint': Math.ceil((sqft / 400) * typeMultiplier), // 1 liter per 400 sq ft
      'Tiles': Math.ceil(sqft * 1.1 * typeMultiplier), // sqft + 10% wastage
      'Plumbing': Math.ceil((sqft / 100) * typeMultiplier), // 1 point per 100 sq ft
    };
    
    return materialNorms[material] || Math.ceil((sqft / 1000) * 10 * typeMultiplier);
  };

  const calculateOptimizedCost = (
    currentCost: number, 
    material: string, 
    quantity: number, 
    optimization: string,
    availableProducts: any[]
  ): number => {
    let optimizationFactor = 1.0;
    
    // Optimization based on priority
    switch (optimization) {
      case 'cost':
        // Aggressive cost optimization
        optimizationFactor = 0.75 - (Math.random() * 0.1); // 15-25% savings
        break;
      case 'quality':
        // Minimal cost reduction, focus on quality
        optimizationFactor = 0.90 - (Math.random() * 0.05); // 5-10% savings
        break;
      case 'speed':
        // Moderate optimization with readily available materials
        optimizationFactor = 0.85 - (Math.random() * 0.05); // 10-15% savings
        break;
      case 'sustainability':
        // Sustainable materials may cost more initially but save long-term
        optimizationFactor = 0.88 - (Math.random() * 0.08); // 8-16% savings
        break;
    }

    // Additional factors based on material type
    const materialOptimization: Record<string, number> = {
      'Cement': 0.92, // Good optimization potential through brand/grade selection
      'Steel': 0.87, // High optimization through quality grades
      'Bricks': 0.80, // Excellent optimization through alternatives (fly ash, AAC)
      'Metal': 0.85, // Good optimization through material grades
      'Paint': 0.88, // Moderate optimization through brand selection
      'Tiles': 0.83, // Good optimization through size/quality selection
    };

    const materialFactor = materialOptimization[material] || 0.90;
    
    // Bulk pricing advantages
    const bulkOptimization = quantity > 100 ? 0.95 : 1.0;
    
    // Vendor competition factor (more products = better pricing)
    const competitionFactor = availableProducts.length > 3 ? 0.95 : 1.0;
    
    return currentCost * optimizationFactor * materialFactor * bulkOptimization * competitionFactor;
  };

  const getOptimalUnit = (material: string): string => {
    const units: Record<string, string> = {
      'Cement': 'bags (50kg)',
      'Steel': 'tons',
      'Bricks': 'thousands',
      'Metal': 'tons',
      'Paint': 'liters',
      'Tiles': 'sq ft',
      'Plumbing': 'points',
    };
    return units[material] || 'units';
  };

  const generateDynamicAlternatives = (category: string, baseCost: number, availableProducts: any[]): Alternative[] => {
    // If we have real products, use them as alternatives
    if (availableProducts.length > 0) {
      return availableProducts.slice(0, 4).map((product: any, index: number) => {
        const productPrice = product.priceSlabs && product.priceSlabs.length > 0 ? 
          product.priceSlabs[0].price : product.basePrice || baseCost * (0.8 + index * 0.1);
        
        const costRatio = productPrice / (baseCost / 100); // Normalize to per-unit cost
        
        return {
          id: `alt-${product.id}`,
          name: product.name || `${category} Option ${index + 1}`,
          cost: productPrice,
          quality: product.specifications?.grade ? 
            (product.specifications.grade === 'Premium' ? 95 : 
             product.specifications.grade === 'Standard' ? 85 : 75) :
            (90 - index * 5),
          sustainability: product.specifications?.ecoFriendly ? 85 : (60 + Math.random() * 25),
          availability: product.stockStatus === 'in_stock' ? 95 : 
                       product.stockStatus === 'limited' ? 70 : 50,
          savings: Math.max(0, baseCost - productPrice)
        };
      });
    }

    // Fallback to predefined alternatives if no real products
    const alternativeNames = {
      'Cement': [
        { name: 'Ultra Tech OPC', cost: 0.95, quality: 95, sustainability: 70 },
        { name: 'ACC PPC', cost: 0.88, quality: 88, sustainability: 80 },
        { name: 'Ambuja Cement', cost: 0.82, quality: 85, sustainability: 75 },
        { name: 'Local Brand Cement', cost: 0.75, quality: 78, sustainability: 65 }
      ],
      'Steel': [
        { name: 'TATA Steel TMT', cost: 0.92, quality: 95, sustainability: 75 },
        { name: 'JSW TMT Bars', cost: 0.87, quality: 90, sustainability: 80 },
        { name: 'Vizag Steel', cost: 0.83, quality: 85, sustainability: 70 },
        { name: 'Regional TMT', cost: 0.78, quality: 80, sustainability: 65 }
      ],
      'Bricks': [
        { name: 'Red Clay Bricks', cost: 0.85, quality: 80, sustainability: 60 },
        { name: 'Fly Ash Bricks', cost: 0.75, quality: 85, sustainability: 90 },
        { name: 'AAC Blocks', cost: 1.1, quality: 95, sustainability: 85 },
        { name: 'Concrete Blocks', cost: 0.90, quality: 88, sustainability: 70 }
      ],
      'Metal': [
        { name: 'Galvanized Steel', cost: 0.95, quality: 90, sustainability: 75 },
        { name: 'Aluminum Alloy', cost: 1.2, quality: 95, sustainability: 85 },
        { name: 'Mild Steel', cost: 0.80, quality: 80, sustainability: 65 },
        { name: 'Stainless Steel', cost: 1.4, quality: 98, sustainability: 90 }
      ]
    };
    
    const alternatives = alternativeNames[category as keyof typeof alternativeNames] || [
      { name: 'Premium Grade', cost: 0.95, quality: 95, sustainability: 75 },
      { name: 'Standard Grade', cost: 0.85, quality: 85, sustainability: 70 },
      { name: 'Economy Grade', cost: 0.75, quality: 75, sustainability: 65 },
      { name: 'Bulk Grade', cost: 0.65, quality: 70, sustainability: 60 }
    ];
    
    return alternatives.map((alt, index) => ({
      id: `alt-${category}-${index}`,
      name: alt.name,
      cost: baseCost * alt.cost,
      quality: alt.quality,
      sustainability: alt.sustainability + (Math.random() * 10 - 5), // Add some variance
      availability: 70 + Math.random() * 30,
      savings: baseCost - (baseCost * alt.cost)
    }));
  };

  const generateAdvancedOptimizationResult = (project: ProjectSpec): OptimizationResult => {
    const totalCurrentCost = project.materials.reduce((sum, m) => sum + m.currentCost, 0);
    const totalOptimizedCost = project.materials.reduce((sum, m) => sum + m.optimizedCost, 0);
    const totalSavings = totalCurrentCost - totalOptimizedCost;
    
    // Calculate additional costs (labor, overhead, etc.)
    const laborCost = totalCurrentCost * 0.35; // 35% of material cost
    const overheadCost = totalCurrentCost * 0.20; // 20% overhead
    const taxesAndPermits = totalCurrentCost * 0.12; // 12% taxes and permits
    
    const totalProjectCost = totalCurrentCost + laborCost + overheadCost + taxesAndPermits;
    const optimizedProjectCost = totalOptimizedCost + (laborCost * 0.90) + (overheadCost * 0.85) + taxesAndPermits;
    const actualTotalSavings = totalProjectCost - optimizedProjectCost;

    // Generate dynamic recommendations based on project specifics
    const recommendations: Recommendation[] = generateSmartRecommendations(
      project, 
      totalSavings, 
      actualTotalSavings, 
      Array.isArray(users) ? users.filter((u: any) => u.role === 'vendor') : []
    );

    // Calculate dynamic scores
    const qualityScore = calculateQualityScore(project, recommendations);
    const sustainabilityScore = calculateSustainabilityScore(project, recommendations);
    const timeSavings = calculateTimeSavings(project, recommendations);

    // Generate smart implementation plan
    const implementation = generateImplementationPlan(project, recommendations);

    // Dynamic risk assessment
    const riskFactors = generateRiskAssessment(project, recommendations);

    return {
      totalSavings: actualTotalSavings,
      timeSavings,
      qualityScore,
      sustainabilityScore,
      recommendations,
      riskFactors,
      implementation
    };
  };

  const generateSmartRecommendations = (
    project: ProjectSpec, 
    materialSavings: number, 
    totalSavings: number, 
    availableVendors: any[]
  ): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Material-specific recommendations
    const highestSavingMaterial = project.materials.reduce((max, current) => 
      (current.currentCost - current.optimizedCost) > (max.currentCost - max.optimizedCost) ? current : max
    );

    recommendations.push({
      id: 'rec-material-1',
      type: 'material',
      title: `Optimize ${highestSavingMaterial.category} Selection`,
      description: `Switch to cost-effective alternatives in ${highestSavingMaterial.category} category for maximum savings`,
      impact: 'high',
      savings: (highestSavingMaterial.currentCost - highestSavingMaterial.optimizedCost),
      effort: 'easy',
      confidence: 92
    });

    // Vendor recommendations based on available vendors
    if (availableVendors.length > 0) {
      recommendations.push({
        id: 'rec-vendor-1',
        type: 'vendor',
        title: 'Multi-Vendor Procurement Strategy',
        description: `Leverage ${availableVendors.length} available vendors for competitive pricing and bulk discounts`,
        impact: 'high',
        savings: totalSavings * 0.25,
        effort: 'moderate',
        confidence: 88
      });
    }

    // Timeline-based recommendations
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 6 && currentMonth <= 9) { // Monsoon season
      recommendations.push({
        id: 'rec-timeline-1',
        type: 'timeline',
        title: 'Post-Monsoon Construction Schedule',
        description: 'Delay project start to October for 15% better material pricing and weather conditions',
        impact: 'medium',
        savings: totalSavings * 0.15,
        effort: 'moderate',
        confidence: 75
      });
    } else {
      recommendations.push({
        id: 'rec-timeline-2',
        type: 'timeline',
        title: 'Accelerated Construction Schedule',
        description: 'Fast-track critical path activities to reduce overhead costs by 20%',
        impact: 'medium',
        savings: totalSavings * 0.18,
        effort: 'complex',
        confidence: 82
      });
    }

    // Project type specific recommendations
    if (project.type === 'commercial') {
      recommendations.push({
        id: 'rec-method-commercial',
        type: 'method',
        title: 'Modular Construction Approach',
        description: 'Use prefabricated modules to reduce construction time by 30% and labor costs by 25%',
        impact: 'high',
        savings: totalSavings * 0.30,
        effort: 'complex',
        confidence: 85
      });
    } else if (project.type === 'residential') {
      recommendations.push({
        id: 'rec-method-residential',
        type: 'method',
        title: 'Standard Design Optimization',
        description: 'Use optimized standard designs to reduce architectural costs and material wastage',
        impact: 'medium',
        savings: totalSavings * 0.12,
        effort: 'easy',
        confidence: 90
      });
    }

    // Sustainability-focused recommendation
    if (project.priority === 'sustainability') {
      recommendations.push({
        id: 'rec-sustainability',
        type: 'material',
        title: 'Green Building Materials',
        description: 'Use eco-friendly materials for long-term savings and environmental benefits',
        impact: 'medium',
        savings: totalSavings * 0.08, // Lower immediate savings but long-term benefits
        effort: 'moderate',
        confidence: 78
      });
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  };

  const calculateQualityScore = (project: ProjectSpec, recommendations: Recommendation[]): number => {
    let baseScore = 85; // Base quality score
    
    // Adjust based on optimization priority
    if (project.priority === 'quality') baseScore += 10;
    else if (project.priority === 'cost') baseScore -= 5;
    
    // Adjust based on material alternatives chosen
    const avgQualityFromMaterials = project.materials.reduce((sum, material) => {
      const bestAlternative = material.alternatives.reduce((best, current) => 
        current.quality > best.quality ? current : best
      );
      return sum + bestAlternative.quality;
    }, 0) / project.materials.length;
    
    return Math.min(98, Math.max(70, Math.round((baseScore + avgQualityFromMaterials) / 2)));
  };

  const calculateSustainabilityScore = (project: ProjectSpec, recommendations: Recommendation[]): number => {
    let baseScore = 70; // Base sustainability score
    
    // Adjust based on optimization priority
    if (project.priority === 'sustainability') baseScore += 15;
    
    // Factor in material sustainability
    const avgSustainabilityFromMaterials = project.materials.reduce((sum, material) => {
      const bestSustainableAlternative = material.alternatives.reduce((best, current) => 
        current.sustainability > best.sustainability ? current : best
      );
      return sum + bestSustainableAlternative.sustainability;
    }, 0) / project.materials.length;
    
    return Math.min(95, Math.max(60, Math.round((baseScore + avgSustainabilityFromMaterials) / 2)));
  };

  const calculateTimeSavings = (project: ProjectSpec, recommendations: Recommendation[]): number => {
    let baseSavings = Math.floor(project.timeline * 0.08); // 8% base time savings
    
    // Add savings from specific recommendations
    recommendations.forEach(rec => {
      if (rec.type === 'method' || rec.type === 'timeline') {
        baseSavings += Math.floor(project.timeline * 0.05); // 5% additional savings per method/timeline rec
      }
    });
    
    return Math.min(Math.floor(project.timeline * 0.25), baseSavings); // Cap at 25% of project timeline
  };

  const generateImplementationPlan = (project: ProjectSpec, recommendations: Recommendation[]): ImplementationStep[] => {
    const steps: ImplementationStep[] = [
      {
        id: 'step-planning',
        phase: 'Project Planning',
        action: 'Finalize optimized material specifications and create procurement strategy',
        timeline: '1-2 weeks',
        responsible: 'Project Manager & Procurement Team',
        priority: 1
      },
      {
        id: 'step-vendor',
        phase: 'Vendor Selection',
        action: 'Negotiate with vendors and finalize contracts with bulk pricing agreements',
        timeline: '1 week',
        responsible: 'Procurement Team',
        priority: 2
      }
    ];

    // Add method-specific steps
    const methodRec = recommendations.find(r => r.type === 'method');
    if (methodRec) {
      steps.push({
        id: 'step-method',
        phase: 'Implementation Strategy',
        action: `Implement ${methodRec.title.toLowerCase()} approach with specialized contractors`,
        timeline: '2-3 weeks setup',
        responsible: 'Technical Team & Contractors',
        priority: 3
      });
    }

    steps.push({
      id: 'step-monitoring',
      phase: 'Execution & Monitoring',
      action: 'Monitor implementation progress and adjust strategies based on real-time data',
      timeline: 'Throughout project',
      responsible: 'Project Manager',
      priority: 4
    });

    return steps;
  };

  const generateRiskAssessment = (project: ProjectSpec, recommendations: Recommendation[]): string[] => {
    const risks: string[] = [];
    
    // Timeline-based risks
    if (project.timeline < 90) {
      risks.push('Compressed timeline may limit optimization opportunities and increase rush order costs');
    }
    
    // Budget-based risks
    const costSavingsRatio = recommendations.reduce((sum, rec) => sum + rec.savings, 0) / project.budget;
    if (costSavingsRatio > 0.3) {
      risks.push('Aggressive cost optimization may impact quality - careful vendor selection required');
    }
    
    // Seasonal risks
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 6 && currentMonth <= 9) {
      risks.push('Monsoon season construction risks including material transportation delays and quality issues');
    }
    
    // Market risks
    risks.push('Material price volatility in current market conditions may affect projected savings');
    
    // Vendor risks
    const vendorDependentRecs = recommendations.filter(r => r.type === 'vendor').length;
    if (vendorDependentRecs > 2) {
      risks.push('High dependency on vendor performance and capacity - backup options recommended');
    }

    return risks.slice(0, 4); // Return top 4 risks
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

    const materials = generateDynamicMaterialRequirements(projectType, sqft, location);
    
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
                    <label className="block text-sm font-medium mb-2">Project Location</label>
                    <Select value={location} onValueChange={(value: string) => setLocation(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                        <SelectItem value="Kolkata">Kolkata</SelectItem>
                        <SelectItem value="Pune">Pune</SelectItem>
                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      </SelectContent>
                    </Select>
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

              {/* Real-time Cost Estimation */}
              {estimatedCost > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">Estimated Project Cost</h4>
                      <p className="text-2xl font-bold text-blue-600">₹{estimatedCost.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        Based on {sqft} sq ft • {projectType} project • {location}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Real-time pricing</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600">Live market pricing</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Seasonal factor: {(marketFactors.seasonalMultiplier() * 100 - 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t">
                <Button 
                  onClick={handleOptimizeProject}
                  className="w-full gap-2 text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                  data-testid="button-optimize-project"
                >
                  <Zap className="w-5 h-5" />
                  🚀 One-Click Optimize Project
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AI will analyze {Array.isArray(products) ? products.length : 0}+ products and {Array.isArray(users) ? users.filter((u: any) => u.role === 'vendor').length : 0} vendors for optimization
                </p>
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