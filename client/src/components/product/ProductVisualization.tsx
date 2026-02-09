import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Box, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Eye, 
  Layers,
  Settings,
  Download,
  Share,
  Maximize,
  Camera
} from "lucide-react";

interface ProductVisualizationProps {
  product: {
    id: string;
    name: string;
    description: string;
    specifications?: any;
    basePrice: string;
  };
  onClose?: () => void;
}

export default function ProductVisualization({ product, onClose }: ProductVisualizationProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'3d' | 'ar' | 'gallery'>('3d');
  const [isRotating, setIsRotating] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  // Mock 3D viewer (in production, this would integrate with Three.js or similar)
  const render3DViewer = () => (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
      <div className={`transform transition-transform duration-1000 ${isRotating ? 'animate-spin' : ''}`} 
           style={{ transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)` }}>
        <Box className="w-32 h-32 text-blue-600 drop-shadow-lg" />
      </div>
      
      {/* 3D Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => setIsRotating(!isRotating)}
          className="bg-white/80 backdrop-blur"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          className="bg-white/80 backdrop-blur"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          className="bg-white/80 backdrop-blur"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* 3D Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 max-w-xs">
        <h4 className="font-semibold text-sm mb-1">3D Model Info</h4>
        <p className="text-xs text-gray-600">Interactive 3D visualization of {product.name}</p>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <Move3D className="w-3 h-3 mr-1" />
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );

  // Mock AR viewer 
  const renderARViewer = () => (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-purple-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
      <div className="text-center">
        <Camera className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">AR Preview</h3>
        <p className="text-sm text-blue-600 mb-4">See how {product.name} looks in your space</p>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast({ title: "AR Camera", description: "AR view will open on supported devices." })}>
          <Camera className="w-4 h-4 mr-2" />
          Launch AR Camera
        </Button>
      </div>
      
      {/* AR Controls */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-purple-500">AR Ready</Badge>
      </div>
      
      {/* AR Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 max-w-xs">
        <h4 className="font-semibold text-sm mb-1">AR Instructions</h4>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. Allow camera access</li>
          <li>2. Point at a flat surface</li>
          <li>3. Tap to place the product</li>
        </ol>
      </div>
    </div>
  );

  // Mock image gallery
  const renderGallery = () => (
    <div className="w-full h-96 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 h-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
          >
            <Box className="w-8 h-8 text-gray-500" />
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Badge>6 Images</Badge>
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Interactive Product Visualization
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{product.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { const data = `${product.name}\n${product.description || ""}\nPrice: ₹${product.basePrice}`; const blob = new Blob([data], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${product.name.replace(/\s+/g, "-")}.txt`; a.click(); URL.revokeObjectURL(url); toast({ title: "Exported", description: "Product info downloaded." }); }}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast({ title: "Link copied", description: "Share link copied to clipboard." }); }}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Fullscreen", description: "Use your browser's fullscreen (F11) for the best view." })}>
              <Maximize className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              3D Model
            </TabsTrigger>
            <TabsTrigger value="ar" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              AR Preview
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Gallery
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="3d" className="space-y-4">
            {render3DViewer()}
            
            {/* 3D Controls Panel */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">3D Controls</h4>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "3D Settings", description: "Quality and display options." })}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Auto Rotate</label>
                    <Button 
                      variant={isRotating ? "default" : "outline"} 
                      size="sm" 
                      className="w-full mt-1"
                      onClick={() => setIsRotating(!isRotating)}
                    >
                      {isRotating ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-600">Zoom Level</label>
                    <div className="flex items-center gap-1 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                      >
                        -
                      </Button>
                      <span className="text-xs px-2">{(zoom * 100).toFixed(0)}%</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-600">View Angle</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-1"
                      onClick={() => setRotation({ x: 15, y: 45, z: 0 })}
                    >
                      Reset
                    </Button>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-600">Lighting</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-1"
                      onClick={() => toast({ title: "Lighting", description: "Adjust lighting in the viewer." })}
                    >
                      Adjust
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ar" className="space-y-4">
            {renderARViewer()}
            
            {/* AR Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold text-sm">Real-time AR</h4>
                  <p className="text-xs text-gray-600">View in your actual space</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Move3D className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold text-sm">Scale & Position</h4>
                  <p className="text-xs text-gray-600">Adjust size and placement</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Share className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-semibold text-sm">Share & Save</h4>
                  <p className="text-xs text-gray-600">Capture AR screenshots</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="space-y-4">
            {renderGallery()}
            
            {/* Gallery Info */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">Product Images</h4>
                <p className="text-sm text-gray-600">High-resolution product photos</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Download", description: "Product images download started." })}>
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Product Details Panel */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Product Details</h4>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className="text-2xl font-bold text-blue-600">₹{product.basePrice}</div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Specifications</h4>
                {product.specifications && (
                  <div className="space-y-1">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}