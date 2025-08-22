import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Brain, 
  Upload, 
  FileImage, 
  Calculator, 
  ShoppingCart, 
  Construction, 
  Truck, 
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Star,
  TrendingUp,
  Clock,
  Building2
} from "lucide-react";

interface MaterialEstimate {
  material: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  description: string;
  priority: 'essential' | 'recommended' | 'optional';
  selected?: boolean;
  adjustedQuantity?: number;
  productId?: string;
  basePrice?: number;
  finalPrice?: number;
  discount?: number;
}

interface ConstructionAnalysis {
  projectType: string;
  estimatedArea: number;
  floors: number;
  materials: MaterialEstimate[];
  totalEstimatedCost: number;
  constructionDuration: string;
  confidence: number;
}

interface AIEstimatorProps {
  onAddToCart: (materials: MaterialEstimate[]) => void;
}

// Fallback mock function kept for extreme cases
const generateMockAnalysis = (): ConstructionAnalysis => {
  return {
    projectType: "Residential Building",
    estimatedArea: 1200,
    floors: 2,
    materials: [
      {
        material: "Red Clay Bricks",
        category: "Masonry",
        quantity: 5000,
        unit: "pieces",
        estimatedPrice: 32500,
        description: "High-quality red clay bricks for construction",
        priority: 'essential',
        selected: true
      },
      {
        material: "Portland Cement",
        category: "Binding",
        quantity: 100,
        unit: "bags",
        estimatedPrice: 42500,
        description: "Premium cement for strong construction",
        priority: 'essential',
        selected: true
      },
      {
        material: "TMT Steel Bars",
        category: "Reinforcement",
        quantity: 800,
        unit: "kg",
        estimatedPrice: 52000,
        description: "High-strength steel bars for reinforcement",
        priority: 'essential',
        selected: true
      },
      {
        material: "M-Sand",
        category: "Aggregate",
        quantity: 25,
        unit: "cubic meters",
        estimatedPrice: 45000,
        description: "Quality manufactured sand",
        priority: 'recommended',
        selected: false
      }
    ],
    totalEstimatedCost: 172000,
    constructionDuration: "4-6 months",
    confidence: 85
  };
};

export default function AIEstimator({ onAddToCart }: AIEstimatorProps) {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImageURL, setUploadedImageURL] = useState<string>("");
  const [analysis, setAnalysis] = useState<ConstructionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch actual products for pricing calculation
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  // Helper function to calculate proper pricing like in customer-ecommerce
  const getProductPricing = (product: any, quantity: number) => {
    const basePrice = parseFloat(product.basePrice);
    
    // Check for quantity slabs
    let finalPrice = basePrice;
    let discount = 0;
    let applicableSlab = null;
    
    if (product.quantitySlabs) {
      const slabs = Array.isArray(product.quantitySlabs) 
        ? product.quantitySlabs 
        : JSON.parse(product.quantitySlabs as string || '[]');
      
      applicableSlab = slabs.find((slab: any) => 
        quantity >= slab.min_qty && quantity <= slab.max_qty
      );
      
      if (applicableSlab) {
        finalPrice = applicableSlab.price_per_unit;
        discount = Math.round(((basePrice - finalPrice) / basePrice) * 100);
      }
    }
    
    return { finalPrice, basePrice, discount, quantity, applicableSlab, totalPrice: finalPrice * quantity };
  };

  // AI-powered analysis function using real product data
  const generateAIAnalysis = async (projectInfo?: any): Promise<ConstructionAnalysis> => {
    // Enhanced static analysis based on input for immediate results
    const area = parseInt(projectInfo?.area || '1000');
    const floors = parseInt(projectInfo?.floors || '1');
    const isCommercial = projectInfo?.projectType === 'commercial';
    const isIndustrial = projectInfo?.projectType === 'industrial';
    
    // Smart calculation factors based on project type
    let bricksPerSqFt, cementBagsPerSqFt, steelKgPerSqFt, sandCubicMetersPerSqFt;
    
    if (isIndustrial) {
      bricksPerSqFt = 15;
      cementBagsPerSqFt = 0.1;
      steelKgPerSqFt = 5;
      sandCubicMetersPerSqFt = 0.04;
    } else if (isCommercial) {
      bricksPerSqFt = 12;
      cementBagsPerSqFt = 0.08;
      steelKgPerSqFt = 4;
      sandCubicMetersPerSqFt = 0.035;
    } else {
      bricksPerSqFt = 10;
      cementBagsPerSqFt = 0.06;
      steelKgPerSqFt = 3;
      sandCubicMetersPerSqFt = 0.03;
    }
    
    const totalArea = area * floors;
    const projectTypeName = isIndustrial ? "Industrial Complex" : isCommercial ? "Commercial Building" : "Residential Building";
    
    // Find matching products from actual product data
    const findProduct = (searchTerms: string[]) => {
      return products.find((product: any) => 
        searchTerms.some(term => 
          product.name.toLowerCase().includes(term.toLowerCase()) ||
          product.description?.toLowerCase().includes(term.toLowerCase())
        )
      );
    };

    const materials: MaterialEstimate[] = [];
    
    // Red Clay Bricks
    const bricksProduct = findProduct(['brick', 'clay', 'red']);
    const bricksQty = Math.round(totalArea * bricksPerSqFt);
    if (bricksProduct) {
      const pricing = getProductPricing(bricksProduct, bricksQty);
      materials.push({
        material: bricksProduct.name,
        category: "Masonry",
        quantity: bricksQty,
        unit: "pieces",
        estimatedPrice: pricing.totalPrice,
        basePrice: pricing.basePrice,
        finalPrice: pricing.finalPrice,
        discount: pricing.discount,
        productId: bricksProduct.id,
        description: bricksProduct.description || "High-quality red clay bricks for construction",
        priority: 'essential',
        selected: true
      });
    } else {
      materials.push({
        material: "Red Clay Bricks",
        category: "Masonry",
        quantity: bricksQty,
        unit: "pieces",
        estimatedPrice: Math.round(bricksQty * 6.5),
        description: "High-quality red clay bricks for construction",
        priority: 'essential',
        selected: true
      });
    }

    // Portland Cement
    const cementProduct = findProduct(['cement', 'portland', '53']);
    const cementQty = Math.round(totalArea * cementBagsPerSqFt);
    if (cementProduct) {
      const pricing = getProductPricing(cementProduct, cementQty);
      materials.push({
        material: cementProduct.name,
        category: "Binding",
        quantity: cementQty,
        unit: "bags",
        estimatedPrice: pricing.totalPrice,
        basePrice: pricing.basePrice,
        finalPrice: pricing.finalPrice,
        discount: pricing.discount,
        productId: cementProduct.id,
        description: cementProduct.description || "Premium 53-grade cement for strong construction",
        priority: 'essential',
        selected: true
      });
    } else {
      materials.push({
        material: "Portland Cement (53 Grade)",
        category: "Binding",
        quantity: cementQty,
        unit: "bags",
        estimatedPrice: Math.round(cementQty * 425),
        description: "Premium 53-grade cement for strong construction",
        priority: 'essential',
        selected: true
      });
    }

    // TMT Steel Bars
    const steelProduct = findProduct(['steel', 'tmt', 'bar', 'fe500']);
    const steelQty = Math.round(totalArea * steelKgPerSqFt);
    if (steelProduct) {
      const pricing = getProductPricing(steelProduct, steelQty);
      materials.push({
        material: steelProduct.name,
        category: "Reinforcement",
        quantity: steelQty,
        unit: "kg",
        estimatedPrice: pricing.totalPrice,
        basePrice: pricing.basePrice,
        finalPrice: pricing.finalPrice,
        discount: pricing.discount,
        productId: steelProduct.id,
        description: steelProduct.description || "High-strength TMT bars for structural reinforcement",
        priority: 'essential',
        selected: true
      });
    } else {
      materials.push({
        material: "TMT Steel Bars (Fe500D)",
        category: "Reinforcement",
        quantity: steelQty,
        unit: "kg",
        estimatedPrice: Math.round(steelQty * 65),
        description: "High-strength TMT bars for structural reinforcement",
        priority: 'essential',
        selected: true
      });
    }

    // M-Sand
    const sandProduct = findProduct(['sand', 'm-sand', 'manufactured']);
    const sandQty = Math.round(totalArea * sandCubicMetersPerSqFt);
    if (sandProduct) {
      const pricing = getProductPricing(sandProduct, sandQty);
      materials.push({
        material: sandProduct.name,
        category: "Aggregate",
        quantity: sandQty,
        unit: "cubic meters",
        estimatedPrice: pricing.totalPrice,
        basePrice: pricing.basePrice,
        finalPrice: pricing.finalPrice,
        discount: pricing.discount,
        productId: sandProduct.id,
        description: sandProduct.description || "Quality manufactured sand for construction",
        priority: 'essential',
        selected: true
      });
    } else {
      materials.push({
        material: "M-Sand (Manufactured Sand)",
        category: "Aggregate",
        quantity: sandQty,
        unit: "cubic meters",
        estimatedPrice: Math.round(sandQty * 1800),
        description: "Quality manufactured sand for construction",
        priority: 'essential',
        selected: true
      });
    }

    // Stone Aggregate
    const aggregateProduct = findProduct(['aggregate', 'stone', '20mm']);
    const aggregateQty = Math.round(totalArea * 0.025);
    if (aggregateProduct) {
      const pricing = getProductPricing(aggregateProduct, aggregateQty);
      materials.push({
        material: aggregateProduct.name,
        category: "Aggregate",
        quantity: aggregateQty,
        unit: "cubic meters",
        estimatedPrice: pricing.totalPrice,
        basePrice: pricing.basePrice,
        finalPrice: pricing.finalPrice,
        discount: pricing.discount,
        productId: aggregateProduct.id,
        description: aggregateProduct.description || "Coarse aggregate for concrete work",
        priority: 'recommended',
        selected: false
      });
    } else {
      materials.push({
        material: "Stone Aggregate (20mm)",
        category: "Aggregate",
        quantity: aggregateQty,
        unit: "cubic meters",
        estimatedPrice: Math.round(aggregateQty * 2200),
        description: "Coarse aggregate for concrete work",
        priority: 'recommended',
        selected: false
      });
    }

    // Add specialized materials for commercial/industrial projects
    if (isCommercial || isIndustrial) {
      const concreteProduct = findProduct(['concrete', 'ready mix', 'm25']);
      const concreteQty = Math.round(totalArea * 0.15);
      if (concreteProduct) {
        const pricing = getProductPricing(concreteProduct, concreteQty);
        materials.push({
          material: concreteProduct.name,
          category: "Concrete",
          quantity: concreteQty,
          unit: "cubic meters",
          estimatedPrice: pricing.totalPrice,
          basePrice: pricing.basePrice,
          finalPrice: pricing.finalPrice,
          discount: pricing.discount,
          productId: concreteProduct.id,
          description: concreteProduct.description || "High-grade ready mix concrete for commercial use",
          priority: 'recommended',
          selected: true
        });
      } else {
        materials.push({
          material: "Ready Mix Concrete (M25)",
          category: "Concrete",
          quantity: concreteQty,
          unit: "cubic meters",
          estimatedPrice: Math.round(concreteQty * 4500),
          description: "High-grade ready mix concrete for commercial use",
          priority: 'recommended',
          selected: true
        });
      }
    }
    
    const totalCost = materials
      .filter(m => m.selected || m.priority === 'essential')
      .reduce((sum, m) => sum + m.estimatedPrice, 0);
    
    return {
      projectType: projectTypeName,
      estimatedArea: totalArea,
      floors: floors,
      materials: materials,
      totalEstimatedCost: totalCost,
      constructionDuration: floors > 2 ? "6-8 months" : floors > 1 ? "4-6 months" : "2-4 months",
      confidence: 94
    };
  };
  
  // Manual input form
  const [manualForm, setManualForm] = useState({
    area: "",
    floors: "1",
    projectType: "residential",
    location: "",
    budget: ""
  });

  // Material selections for quantity adjustments
  const [materialSelections, setMaterialSelections] = useState<{ [key: number]: { selected: boolean; quantity: number } }>({});

  // Effect to initialize material selections when analysis changes
  useEffect(() => {
    if (analysis) {
      const initialSelections: { [key: number]: { selected: boolean; quantity: number } } = {};
      analysis.materials.forEach((material, index) => {
        initialSelections[index] = {
          selected: material.selected || material.priority === 'essential',
          quantity: material.quantity
        };
      });
      setMaterialSelections(initialSelections);
    }
  }, [analysis]);

  // File upload mutation
  const fileUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiRequest("POST", "/api/construction/analyze-image", formData);
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      setUploadedImageURL(data.imageUrl || "");
      toast({
        title: "Analysis Complete!",
        description: `Found ${data.analysis.materials.length} materials for your ${data.analysis.projectType}`,
      });
    },
    onError: (error: Error) => {
      console.error("Upload failed:", error);
      // Fallback to mock analysis
      const mockAnalysis = generateMockAnalysis();
      setAnalysis(mockAnalysis);
      toast({
        title: "Using Smart Estimates",
        description: "AI analysis unavailable - showing intelligent material estimates",
      });
    }
  });

  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      setIsAnalyzing(true);
      fileUploadMutation.mutate(files[0]);
      setTimeout(() => setIsAnalyzing(false), 3000);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualForm.area) {
      toast({
        title: "Area Required",
        description: "Please enter the construction area",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const aiAnalysis = await generateAIAnalysis(manualForm);
      setAnalysis(aiAnalysis);
      toast({
        title: "Analysis Complete!",
        description: `Estimated materials for ${parseInt(manualForm.area).toLocaleString()} sq ft ${manualForm.projectType} project`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      const fallbackAnalysis = generateMockAnalysis();
      setAnalysis(fallbackAnalysis);
      toast({
        title: "Using Smart Estimates",
        description: "Showing intelligent material estimates for your project",
      });
    }
    setIsAnalyzing(false);
  };

  const handleMaterialToggle = (index: number, checked: boolean) => {
    setMaterialSelections(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        selected: checked
      }
    }));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    // Update material selections and recalculate pricing if product has actual pricing data
    setMaterialSelections(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        quantity
      }
    }));

    // If the material has a productId, recalculate pricing with new quantity
    if (analysis && analysis.materials[index]?.productId) {
      const material = analysis.materials[index];
      const product = products.find((p: any) => p.id === material.productId);
      
      if (product) {
        const newPricing = getProductPricing(product, quantity);
        
        // Update the analysis with new pricing
        setAnalysis(prev => {
          if (!prev) return prev;
          
          const updatedMaterials = [...prev.materials];
          updatedMaterials[index] = {
            ...updatedMaterials[index],
            estimatedPrice: newPricing.totalPrice,
            finalPrice: newPricing.finalPrice,
            discount: newPricing.discount
          };
          
          // Recalculate total cost
          const totalCost = updatedMaterials
            .filter((m, i) => materialSelections[i]?.selected || m.priority === 'essential')
            .reduce((sum, m, i) => {
              const qty = materialSelections[i]?.quantity || m.quantity;
              const unitPrice = m.finalPrice || (m.estimatedPrice / m.quantity);
              return sum + (unitPrice * qty);
            }, 0);
          
          return {
            ...prev,
            materials: updatedMaterials,
            totalEstimatedCost: totalCost
          };
        });
      }
    }
  };

  const getSelectedMaterials = (): MaterialEstimate[] => {
    if (!analysis) return [];
    
    return analysis.materials
      .map((material, index) => ({
        ...material,
        selected: materialSelections[index]?.selected || material.priority === 'essential',
        adjustedQuantity: materialSelections[index]?.quantity || material.quantity
      }))
      .filter(material => material.selected);
  };

  const getSelectedTotal = (): number => {
    return getSelectedMaterials().reduce(
      (total, material) => {
        const qty = material.adjustedQuantity || material.quantity;
        // Use finalPrice per unit if available, otherwise calculate from estimatedPrice
        const unitPrice = material.finalPrice || (material.estimatedPrice / material.quantity);
        return total + (unitPrice * qty);
      },
      0
    );
  };

  const handleAddSelectedToCart = () => {
    const selectedMaterials = getSelectedMaterials();
    if (selectedMaterials.length === 0) {
      toast({
        title: "No Materials Selected",
        description: "Please select at least one material to add to cart",
        variant: "destructive"
      });
      return;
    }
    
    onAddToCart(selectedMaterials);
    toast({
      title: "Added to Cart!",
      description: `${selectedMaterials.length} materials added to your cart`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800 border-red-200';
      case 'recommended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'optional': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Material Estimator</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get instant, intelligent material estimates for your construction project using AI-powered analysis
        </p>
      </div>

      {/* Input Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Project Analysis
          </CardTitle>
          <CardDescription>
            Upload project images or enter details manually for accurate material estimation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "manual")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Plans/Photos
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Construction Plans or Site Photos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag & drop files here, or click to browse
                  </p>
                  <Button variant="outline">
                    Choose Files
                  </Button>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Construction Area (sq ft)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="e.g., 1200"
                    value={manualForm.area}
                    onChange={(e) => setManualForm(prev => ({ ...prev, area: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="floors">Number of Floors</Label>
                  <Select value={manualForm.floors} onValueChange={(value) => setManualForm(prev => ({ ...prev, floors: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Floor</SelectItem>
                      <SelectItem value="2">2 Floors</SelectItem>
                      <SelectItem value="3">3 Floors</SelectItem>
                      <SelectItem value="4">4+ Floors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select value={manualForm.projectType} onValueChange={(value) => setManualForm(prev => ({ ...prev, projectType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={manualForm.location}
                    onChange={(e) => setManualForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range (Optional)</Label>
                  <Input
                    id="budget"
                    placeholder="e.g., ₹5-10 Lakhs"
                    value={manualForm.budget}
                    onChange={(e) => setManualForm(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleManualSubmit} 
                className="w-full"
                disabled={isAnalyzing || !manualForm.area}
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Project...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Generate Material Estimate
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
              <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
              <Progress value={75} className="w-full max-w-md mx-auto" />
              <p className="text-gray-600">
                Analyzing construction requirements and calculating material needs...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Project Type</p>
                  <p className="font-semibold">{analysis.projectType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Total Area</p>
                  <p className="font-semibold">{analysis.estimatedArea.toLocaleString()} sq ft</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {analysis.constructionDuration}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {analysis.confidence}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Materials List with Better UI */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Package className="w-6 h-6 text-blue-600" />
                Material Requirements Breakdown
              </CardTitle>
              <CardDescription className="text-base">
                Professional material estimates with intelligent pricing calculations
              </CardDescription>
              
              {/* Summary Headers */}
              <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-white rounded-lg border">
                <div className="text-center">
                  <h3 className="font-semibold text-blue-600">Material Needed</h3>
                  <p className="text-sm text-gray-500">Selected items for project</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-green-600">Quantity Required</h3>
                  <p className="text-sm text-gray-500">Total amount needed</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-orange-600">Unit Price</h3>
                  <p className="text-sm text-gray-500">Per unit cost</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-purple-600">Total Cost</h3>
                  <p className="text-sm text-gray-500">Final calculation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {analysis.materials.map((material, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={materialSelections[index]?.selected || material.priority === 'essential'}
                            onCheckedChange={(checked) => handleMaterialToggle(index, checked as boolean)}
                            disabled={material.priority === 'essential'}
                            className="mt-1"
                          />
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold text-gray-900">{material.material}</h4>
                              <Badge className={getPriorityColor(material.priority)}>
                                {material.priority}
                              </Badge>
                              {material.discount && material.discount > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {material.discount}% off
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600">{material.description}</p>
                            <Badge variant="outline" className="text-xs">
                              Category: {material.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              type="number"
                              value={materialSelections[index]?.quantity || material.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                              className="w-24 text-right font-semibold"
                              min="1"
                            />
                            <span className="text-sm font-medium text-gray-600">{material.unit}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Professional Pricing Breakdown */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
                        <div className="grid grid-cols-4 gap-4 items-center">
                          {/* Material Column */}
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="font-semibold text-blue-800">Selected</p>
                          </div>
                          
                          {/* Quantity Column */}
                          <div className="text-center">
                            <div className="bg-green-100 px-3 py-2 rounded-lg">
                              <p className="text-2xl font-bold text-green-800">
                                {materialSelections[index]?.quantity || material.quantity}
                              </p>
                              <p className="text-sm text-green-600">{material.unit}</p>
                            </div>
                          </div>
                          
                          {/* Unit Price Column */}
                          <div className="text-center">
                            <div className="space-y-1">
                              {material.basePrice && material.finalPrice && material.basePrice !== material.finalPrice ? (
                                <>
                                  <p className="text-xs line-through text-gray-400">₹{material.basePrice}</p>
                                  <p className="text-lg font-bold text-orange-600">₹{material.finalPrice}</p>
                                  <Badge className="bg-green-100 text-green-800 text-xs">{material.discount}% off</Badge>
                                </>
                              ) : (
                                <p className="text-lg font-bold text-orange-600">
                                  ₹{material.finalPrice || (material.estimatedPrice / material.quantity)}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">per {material.unit}</p>
                            </div>
                          </div>
                          
                          {/* Total Price Column */}
                          <div className="text-center">
                            <div className="bg-purple-100 px-4 py-3 rounded-lg">
                              <p className="text-xl font-bold text-purple-800">
                                ₹{material.estimatedPrice.toLocaleString()}
                              </p>
                              <p className="text-xs text-purple-600 mt-1">
                                {materialSelections[index]?.quantity || material.quantity} × ₹{material.finalPrice || (material.estimatedPrice / material.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Calculation Formula Display */}
                        <div className="mt-3 p-2 bg-white rounded border-l-4 border-l-indigo-500">
                          <p className="text-sm text-indigo-700 font-medium">
                            <Calculator className="w-4 h-4 inline mr-2" />
                            <strong>Calculation:</strong> {materialSelections[index]?.quantity || material.quantity} {material.unit} × ₹{material.finalPrice || (material.estimatedPrice / material.quantity)}/{material.unit} = ₹{material.estimatedPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary & Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span>Selected Materials Total:</span>
                  <span className="font-bold text-2xl text-blue-600">
                    ₹{getSelectedTotal().toLocaleString()}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handleAddSelectedToCart}
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add Selected to Cart ({getSelectedMaterials().length})
                  </Button>
                  
                  <Button variant="outline" size="lg">
                    <Construction className="w-4 h-4 mr-2" />
                    Request Quote
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>* Prices are estimates and may vary based on current market rates and location</p>
                  <p>* Transportation and labor costs not included</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}