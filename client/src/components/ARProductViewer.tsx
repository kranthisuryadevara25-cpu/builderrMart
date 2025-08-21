import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Eye, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Box, 
  Camera, 
  Download, 
  Share2,
  Fullscreen,
  Settings,
  Layers,
  Ruler,
  Palette,
  Sun,
  Moon,
  Grid3X3
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ARProductViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onShare?: (product: Product) => void;
}

interface ARControls {
  rotation: { x: number; y: number; z: number };
  scale: number;
  position: { x: number; y: number; z: number };
  lighting: 'natural' | 'studio' | 'outdoor';
  background: 'transparent' | 'white' | 'gray' | 'construction_site';
  showGrid: boolean;
  showRuler: boolean;
}

export default function ARProductViewer({ 
  isOpen, 
  onOpenChange, 
  product, 
  onShare 
}: ARProductViewerProps) {
  const [activeTab, setActiveTab] = useState<'3d' | 'ar' | 'compare'>('3d');
  const [isLoading, setIsLoading] = useState(true);
  const [arSupported, setArSupported] = useState(false);
  const [controls, setControls] = useState<ARControls>({
    rotation: { x: 0, y: 45, z: 0 },
    scale: 1,
    position: { x: 0, y: 0, z: 0 },
    lighting: 'studio',
    background: 'white',
    showGrid: true,
    showRuler: false
  });

  // Simulate loading and AR support detection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate AR support detection (in real implementation, check for WebXR)
      setArSupported(Math.random() > 0.3); // 70% chance of AR support
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Get product-specific 3D model information
  const getProductMaterial = () => {
    const productName = product.name.toLowerCase();
    if (productName.includes('cement')) return 'concrete';
    if (productName.includes('steel') || productName.includes('tmt')) return 'steel';
    if (productName.includes('brick')) return 'brick';
    if (productName.includes('tile')) return 'ceramic';
    if (productName.includes('paint')) return 'liquid';
    return 'generic';
  };

  const getProductDimensions = () => {
    const specs = product.specs ? 
      (typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs) : {};
    
    return {
      length: specs.length || specs.size?.split('x')[0] || '1m',
      width: specs.width || specs.size?.split('x')[1] || '1m', 
      height: specs.height || specs.thickness || '10cm',
      weight: specs.weight || '50kg'
    };
  };

  const resetView = () => {
    setControls(prev => ({
      ...prev,
      rotation: { x: 0, y: 45, z: 0 },
      scale: 1,
      position: { x: 0, y: 0, z: 0 }
    }));
  };

  const dimensions = getProductDimensions();
  const material = getProductMaterial();

  const renderMockViewer = () => {
    const rotationStyle = {
      transform: `rotateX(${controls.rotation.x}deg) rotateY(${controls.rotation.y}deg) rotateZ(${controls.rotation.z}deg) scale(${controls.scale})`,
      transformStyle: 'preserve-3d' as const
    };

    return (
      <div 
        className={`relative w-full h-96 rounded-lg overflow-hidden ${
          controls.background === 'white' ? 'bg-white' :
          controls.background === 'gray' ? 'bg-gray-100' :
          controls.background === 'construction_site' ? 'bg-gradient-to-b from-blue-200 to-yellow-100' :
          'bg-transparent'
        }`}
      >
        {/* Grid overlay */}
        {controls.showGrid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {/* Mock 3D Product */}
        <div className="flex items-center justify-center h-full">
          <div 
            className="relative transition-transform duration-300"
            style={rotationStyle}
          >
            {/* Product representation based on type */}
            {material === 'concrete' && (
              <div className="w-32 h-20 bg-gradient-to-b from-gray-300 to-gray-500 rounded-lg shadow-2xl border-2 border-gray-400">
                <div className="text-center pt-6 text-xs font-bold text-gray-700">CEMENT</div>
              </div>
            )}
            
            {material === 'steel' && (
              <div className="w-2 h-40 bg-gradient-to-b from-gray-400 to-gray-700 rounded-full shadow-2xl transform rotate-12">
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">TMT BAR</div>
              </div>
            )}
            
            {material === 'brick' && (
              <div className="grid grid-cols-2 gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-12 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-sm shadow-lg border border-red-700" />
                ))}
              </div>
            )}
            
            {material === 'ceramic' && (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg shadow-2xl border-2 border-blue-500">
                <div className="text-center pt-8 text-xs font-bold text-blue-800">TILE</div>
              </div>
            )}
            
            {(material === 'liquid' || material === 'generic') && (
              <div className="w-20 h-32 bg-gradient-to-b from-blue-300 to-blue-600 rounded-lg shadow-2xl border-2 border-blue-400">
                <div className="text-center pt-12 text-xs font-bold text-white">PAINT</div>
              </div>
            )}
          </div>
        </div>

        {/* Ruler overlay */}
        {controls.showRuler && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
            <div>L: {dimensions.length}</div>
            <div>W: {dimensions.width}</div>
            <div>H: {dimensions.height}</div>
          </div>
        )}

        {/* Lighting indicator */}
        <div className="absolute top-4 right-4">
          {controls.lighting === 'natural' && <Sun className="w-6 h-6 text-yellow-500" />}
          {controls.lighting === 'studio' && <Camera className="w-6 h-6 text-blue-500" />}
          {controls.lighting === 'outdoor' && <Eye className="w-6 h-6 text-green-500" />}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading 3D model...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderControls = () => (
    <div className="space-y-4">
      {/* Rotation Controls */}
      <div>
        <label className="text-sm font-medium mb-2 block">Rotation</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs w-4">X:</span>
            <Slider
              value={[controls.rotation.x]}
              onValueChange={(value) => setControls(prev => ({
                ...prev,
                rotation: { ...prev.rotation, x: value[0] }
              }))}
              min={-180}
              max={180}
              step={5}
              className="flex-1"
            />
            <span className="text-xs w-8">{controls.rotation.x}°</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-4">Y:</span>
            <Slider
              value={[controls.rotation.y]}
              onValueChange={(value) => setControls(prev => ({
                ...prev,
                rotation: { ...prev.rotation, y: value[0] }
              }))}
              min={-180}
              max={180}
              step={5}
              className="flex-1"
            />
            <span className="text-xs w-8">{controls.rotation.y}°</span>
          </div>
        </div>
      </div>

      {/* Scale Control */}
      <div>
        <label className="text-sm font-medium mb-2 block">Scale</label>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => 
            setControls(prev => ({ ...prev, scale: Math.max(0.2, prev.scale - 0.1) }))
          }>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Slider
            value={[controls.scale]}
            onValueChange={(value) => setControls(prev => ({ ...prev, scale: value[0] }))}
            min={0.2}
            max={3}
            step={0.1}
            className="flex-1"
          />
          <Button size="sm" variant="outline" onClick={() => 
            setControls(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }))
          }>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Lighting */}
      <div>
        <label className="text-sm font-medium mb-2 block">Lighting</label>
        <div className="flex gap-2">
          {(['natural', 'studio', 'outdoor'] as const).map(lighting => (
            <Button
              key={lighting}
              size="sm"
              variant={controls.lighting === lighting ? 'default' : 'outline'}
              onClick={() => setControls(prev => ({ ...prev, lighting }))}
              className="capitalize"
            >
              {lighting === 'natural' && <Sun className="w-4 h-4 mr-1" />}
              {lighting === 'studio' && <Camera className="w-4 h-4 mr-1" />}
              {lighting === 'outdoor' && <Eye className="w-4 h-4 mr-1" />}
              {lighting}
            </Button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="text-sm font-medium mb-2 block">Background</label>
        <div className="flex gap-2">
          {(['white', 'gray', 'construction_site'] as const).map(bg => (
            <Button
              key={bg}
              size="sm"
              variant={controls.background === bg ? 'default' : 'outline'}
              onClick={() => setControls(prev => ({ ...prev, background: bg }))}
              className="capitalize"
            >
              {bg.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Overlays */}
      <div>
        <label className="text-sm font-medium mb-2 block">Display Options</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={controls.showGrid}
              onChange={(e) => setControls(prev => ({ ...prev, showGrid: e.target.checked }))}
              className="rounded"
            />
            <Grid3X3 className="w-4 h-4" />
            <span className="text-sm">Grid</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={controls.showRuler}
              onChange={(e) => setControls(prev => ({ ...prev, showRuler: e.target.checked }))}
              className="rounded"
            />
            <Ruler className="w-4 h-4" />
            <span className="text-sm">Measurements</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={resetView}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset View
        </Button>
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Box className="w-6 h-6 mr-2 text-blue-600" />
            AR Product Viewer - {product.name}
          </DialogTitle>
          <DialogDescription>
            Visualize construction materials in 3D and AR before you buy
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              3D View
            </TabsTrigger>
            <TabsTrigger value="ar" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              AR View
              {!arSupported && <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>}
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Size Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="3d" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D Viewer */}
              <div className="lg:col-span-2 space-y-4">
                {renderMockViewer()}
                
                {/* Product Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Material</p>
                        <p className="font-semibold capitalize">{material}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Dimensions</p>
                        <p className="font-semibold">{dimensions.length} × {dimensions.width}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Weight</p>
                        <p className="font-semibold">{dimensions.weight}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stock</p>
                        <p className="font-semibold">{product.stockQuantity?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderControls()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ar" className="space-y-4">
            <div className="text-center py-12">
              {arSupported ? (
                <div>
                  <Eye className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">AR Experience Ready!</h3>
                  <p className="text-gray-600 mb-6">
                    Point your device at a flat surface to place the {product.name} in your space
                  </p>
                  <Button size="lg" className="mr-4">
                    <Camera className="w-5 h-5 mr-2" />
                    Start AR View
                  </Button>
                  <Button size="lg" variant="outline">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share AR
                  </Button>
                </div>
              ) : (
                <div>
                  <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">AR Not Available</h3>
                  <p className="text-gray-600 mb-6">
                    AR viewing is not supported on this device or browser. 
                    Try using a mobile device with a recent browser version.
                  </p>
                  <Badge variant="outline">Coming Soon for All Devices</Badge>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Size Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative">
                    {/* Human silhouette for scale */}
                    <div className="absolute bottom-4 left-4">
                      <div className="w-8 h-16 bg-gray-400 rounded-full relative">
                        <div className="w-4 h-4 bg-gray-500 rounded-full absolute -top-2 left-2"></div>
                      </div>
                      <p className="text-xs text-gray-600 text-center mt-1">Human</p>
                    </div>
                    
                    {/* Product representation */}
                    <div className="text-center">
                      <div className={`mx-auto mb-2 ${
                        material === 'concrete' ? 'w-16 h-10 bg-gray-400' :
                        material === 'steel' ? 'w-1 h-20 bg-gray-600' :
                        material === 'brick' ? 'w-12 h-6 bg-red-500' :
                        'w-16 h-16 bg-blue-400'
                      }`}></div>
                      <p className="text-xs text-gray-600">{product.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dimensions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-gray-600">{key}:</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-semibold">~0.5 m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coverage:</span>
                        <span className="font-semibold">~10-15 m²</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}