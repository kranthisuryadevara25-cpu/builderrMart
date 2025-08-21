import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Plus, 
  Scale, 
  CheckCircle, 
  AlertCircle, 
  IndianRupee,
  Package,
  Truck,
  Star,
  TrendingUp,
  ArrowLeftRight,
  Heart,
  ShoppingCart
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductComparisonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialProducts?: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductComparison({ 
  isOpen, 
  onOpenChange, 
  initialProducts = [],
  onAddToCart 
}: ProductComparisonProps) {
  const [compareProducts, setCompareProducts] = useState<Product[]>(initialProducts);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Add product to comparison
  const addToComparison = (product: Product) => {
    if (compareProducts.length >= 4) {
      return; // Max 4 products for comparison
    }
    if (!compareProducts.find(p => p.id === product.id)) {
      setCompareProducts([...compareProducts, product]);
    }
    setShowProductSelector(false);
  };

  // Remove product from comparison
  const removeFromComparison = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p.id !== productId));
  };

  // Get comparison score between two products
  const getComparisonScore = (product1: Product, product2: Product): string => {
    const price1 = parseFloat(product1.basePrice);
    const price2 = parseFloat(product2.basePrice);
    const stock1 = product1.stockQuantity || 0;
    const stock2 = product2.stockQuantity || 0;
    
    if (price1 < price2 && stock1 > stock2) return "Better Value";
    if (price1 > price2 && stock1 < stock2) return "Premium Choice";
    if (price1 < price2) return "Better Price";
    if (stock1 > stock2) return "Better Availability";
    return "Similar";
  };

  // Get available products for selection (excluding already selected ones)
  const availableProducts = allProducts.filter(
    product => !compareProducts.find(p => p.id === product.id)
  );

  const renderComparisonTable = () => {
    if (compareProducts.length === 0) {
      return (
        <div className="text-center py-12">
          <Scale className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Products to Compare</h3>
          <p className="text-gray-600 mb-4">Add products to start comparing features and prices</p>
          <Button onClick={() => setShowProductSelector(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Products
          </Button>
        </div>
      );
    }

    // Extract all unique specification keys
    const allSpecKeys = new Set<string>();
    compareProducts.forEach(product => {
      if (product.specs) {
        const specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
        Object.keys(specs).forEach(key => allSpecKeys.add(key));
      }
    });

    return (
      <div className="space-y-6">
        {/* Product Headers */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, 1fr)` }}>
          <div className="font-semibold text-sm text-gray-600">Product</div>
          {compareProducts.map((product, index) => (
            <Card key={product.id} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => removeFromComparison(product.id)}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-green-600">
                    ₹{parseFloat(product.basePrice).toLocaleString()}
                  </div>
                  <Badge variant={product.stockQuantity && product.stockQuantity > 0 ? "secondary" : "destructive"}>
                    {product.stockQuantity && product.stockQuantity > 0 
                      ? `${product.stockQuantity} in stock` 
                      : 'Out of stock'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Scores */}
        {compareProducts.length >= 2 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareProducts.length}, 1fr)` }}>
            <div className="font-semibold text-sm text-gray-600">Comparison Score</div>
            {compareProducts.map((product, index) => (
              <div key={product.id} className="text-center">
                {index > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {getComparisonScore(compareProducts[0], product)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Comparison Table */}
        <Table>
          <TableBody>
            {/* Basic Info */}
            <TableRow>
              <TableCell className="font-medium">Price</TableCell>
              {compareProducts.map(product => (
                <TableCell key={product.id}>
                  <span className="text-lg font-semibold text-green-600">
                    ₹{parseFloat(product.basePrice).toLocaleString()}
                  </span>
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Stock Quantity</TableCell>
              {compareProducts.map(product => (
                <TableCell key={product.id}>
                  <div className="flex items-center gap-2">
                    {product.stockQuantity && product.stockQuantity > 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {product.stockQuantity || 0} units
                  </div>
                </TableCell>
              ))}
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Description</TableCell>
              {compareProducts.map(product => (
                <TableCell key={product.id} className="max-w-xs">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {product.description || "No description available"}
                  </p>
                </TableCell>
              ))}
            </TableRow>

            {/* Specifications */}
            {Array.from(allSpecKeys).map(specKey => (
              <TableRow key={specKey}>
                <TableCell className="font-medium capitalize">
                  {specKey.replace(/([A-Z])/g, ' $1').trim()}
                </TableCell>
                {compareProducts.map(product => {
                  const specs = product.specs ? 
                    (typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs) : {};
                  return (
                    <TableCell key={product.id}>
                      {specs[specKey] || "N/A"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

            {/* Action Buttons */}
            <TableRow>
              <TableCell className="font-medium">Actions</TableCell>
              {compareProducts.map(product => (
                <TableCell key={product.id}>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onAddToCart(product)}
                      disabled={!product.stockQuantity || product.stockQuantity <= 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Heart className="w-4 h-4 mr-1" />
                      Wishlist
                    </Button>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>

        {/* Add More Products */}
        {compareProducts.length < 4 && (
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowProductSelector(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Product ({compareProducts.length}/4)
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ArrowLeftRight className="w-6 h-6 mr-2 text-blue-600" />
              Product Comparison Tool
            </DialogTitle>
            <DialogDescription>
              Compare up to 4 products side-by-side to make the best choice for your needs
            </DialogDescription>
          </DialogHeader>
          
          {renderComparisonTable()}
        </DialogContent>
      </Dialog>

      {/* Product Selector Modal */}
      <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product to Comparison</DialogTitle>
            <DialogDescription>
              Select a product to add to your comparison list
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {availableProducts.map(product => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">
                      ₹{parseFloat(product.basePrice).toLocaleString()}
                    </span>
                    <Button size="sm" onClick={() => addToComparison(product)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}