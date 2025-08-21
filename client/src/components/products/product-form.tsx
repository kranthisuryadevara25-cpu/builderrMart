import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

interface SpecificationField {
  id: string;
  name: string;
  value: string;
}

interface PricingSlabField {
  id: string;
  minQty: number;
  maxQty: number;
  pricePerUnit: number;
}

interface DynamicChargeField {
  id: string;
  name: string;
  rate: number;
  unit: string;
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [specifications, setSpecifications] = useState<SpecificationField[]>([
    { id: "1", name: "", value: "" },
  ]);
  const [pricingSlabs, setPricingSlabs] = useState<PricingSlabField[]>([
    { id: "1", minQty: 1, maxQty: 10, pricePerUnit: 0 },
  ]);
  const [dynamicCharges, setDynamicCharges] = useState<DynamicChargeField[]>([
    { id: "1", name: "", rate: 0, unit: "" },
  ]);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      categoryId: product?.categoryId || "",
      description: product?.description || "",
      basePrice: product?.basePrice || "0",
      vendorId: user?.role === "vendor" ? user.id : product?.vendorId || "",
      stockQuantity: product?.stockQuantity || 0,
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "Product has been created successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: InsertProduct) =>
      apiRequest("PUT", `/api/products/${product?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    // Build specs object
    const specs: Record<string, string> = {};
    specifications.forEach((spec) => {
      if (spec.name && spec.value) {
        specs[spec.name] = spec.value;
      }
    });

    // Build quantity slabs array
    const quantitySlabs = pricingSlabs
      .filter((slab) => slab.minQty && slab.maxQty && slab.pricePerUnit)
      .map((slab) => ({
        min_qty: slab.minQty,
        max_qty: slab.maxQty,
        price_per_unit: slab.pricePerUnit,
      }));

    // Build dynamic charges object
    const dynamicChargesObj: Record<string, any> = {};
    dynamicCharges.forEach((charge) => {
      if (charge.name && charge.rate && charge.unit) {
        dynamicChargesObj[charge.name] = {
          rate: charge.rate,
          unit: charge.unit,
        };
      }
    });

    const productData = {
      ...data,
      specs: Object.keys(specs).length > 0 ? specs : null,
      quantitySlabs: quantitySlabs.length > 0 ? quantitySlabs : null,
      dynamicCharges: Object.keys(dynamicChargesObj).length > 0 ? dynamicChargesObj : null,
    };

    if (product) {
      updateProductMutation.mutate(productData);
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      { id: Date.now().toString(), name: "", value: "" },
    ]);
  };

  const removeSpecification = (id: string) => {
    setSpecifications(specifications.filter((spec) => spec.id !== id));
  };

  const addPricingSlab = () => {
    setPricingSlabs([
      ...pricingSlabs,
      { id: Date.now().toString(), minQty: 1, maxQty: 10, pricePerUnit: 0 },
    ]);
  };

  const removePricingSlab = (id: string) => {
    setPricingSlabs(pricingSlabs.filter((slab) => slab.id !== id));
  };

  const addDynamicCharge = () => {
    setDynamicCharges([
      ...dynamicCharges,
      { id: Date.now().toString(), name: "", rate: 0, unit: "" },
    ]);
  };

  const removeDynamicCharge = (id: string) => {
    setDynamicCharges(dynamicCharges.filter((charge) => charge.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Product description and details"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ₹
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Product Specifications */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md">Product Specifications</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSpecification}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Spec
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {specifications.map((spec, index) => (
                    <div key={spec.id} className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Specification name (e.g., Grade)"
                        value={spec.name}
                        onChange={(e) => {
                          const newSpecs = [...specifications];
                          newSpecs[index].name = e.target.value;
                          setSpecifications(newSpecs);
                        }}
                      />
                      <div className="flex">
                        <Input
                          placeholder="Value (e.g., 43)"
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...specifications];
                            newSpecs[index].value = e.target.value;
                            setSpecifications(newSpecs);
                          }}
                          className="rounded-r-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSpecification(spec.id)}
                          className="rounded-l-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quantity Pricing Slabs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md">Quantity Pricing Slabs</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPricingSlab}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Slab
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pricingSlabs.map((slab, index) => (
                  <div key={slab.id} className="grid grid-cols-4 gap-3 p-4 border rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min Quantity
                      </label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={slab.minQty}
                        onChange={(e) => {
                          const newSlabs = [...pricingSlabs];
                          newSlabs[index].minQty = Number(e.target.value);
                          setPricingSlabs(newSlabs);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Quantity
                      </label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={slab.maxQty}
                        onChange={(e) => {
                          const newSlabs = [...pricingSlabs];
                          newSlabs[index].maxQty = Number(e.target.value);
                          setPricingSlabs(newSlabs);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price per Unit
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="10.00"
                          className="pl-8"
                          value={slab.pricePerUnit}
                          onChange={(e) => {
                            const newSlabs = [...pricingSlabs];
                            newSlabs[index].pricePerUnit = Number(e.target.value);
                            setPricingSlabs(newSlabs);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePricingSlab(slab.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dynamic Charges */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md">Dynamic Charges</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDynamicCharge}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Charge
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dynamicCharges.map((charge, index) => (
                  <div key={charge.id} className="grid grid-cols-4 gap-3 p-4 border rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Charge Name
                      </label>
                      <Input
                        placeholder="Hamali"
                        value={charge.name}
                        onChange={(e) => {
                          const newCharges = [...dynamicCharges];
                          newCharges[index].name = e.target.value;
                          setDynamicCharges(newCharges);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Rate
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="2.00"
                          className="pl-8"
                          value={charge.rate}
                          onChange={(e) => {
                            const newCharges = [...dynamicCharges];
                            newCharges[index].rate = Number(e.target.value);
                            setDynamicCharges(newCharges);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <Input
                        placeholder="bag"
                        value={charge.unit}
                        onChange={(e) => {
                          const newCharges = [...dynamicCharges];
                          newCharges[index].unit = e.target.value;
                          setDynamicCharges(newCharges);
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeDynamicCharge(charge.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {product ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
