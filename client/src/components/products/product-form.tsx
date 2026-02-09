import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertProductSchema, type InsertProduct, type Product, type Category } from "@shared/schema";
import { firebaseApi } from "@/lib/firebase-api";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  /** Show vendor dropdown (admin); when false, vendorId = current user for vendors */
  showVendorSelector?: boolean;
  vendors?: { id: string; username: string }[];
  /** Show Featured / Trending checkboxes (admin) */
  showFeatureFlags?: boolean;
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

interface BulkDiscountSlabField {
  id: string;
  minQty: number;
  discountPercent: number;
}

const DYNAMIC_CHARGE_PRESETS: { name: string; rate: number; unit: string }[] = [
  { name: "Hamali", rate: 0, unit: "bag" },
  { name: "Transportation", rate: 0, unit: "trip" },
  { name: "Loading", rate: 0, unit: "trip" },
  { name: "Packing", rate: 0, unit: "unit" },
  { name: "Unloading", rate: 0, unit: "trip" },
];

export function ProductForm({ open, onOpenChange, product, showVendorSelector, vendors = [], showFeatureFlags }: ProductFormProps) {
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
  const [bulkDiscountSlabs, setBulkDiscountSlabs] = useState<BulkDiscountSlabField[]>(() =>
    (product as any)?.bulkDiscountSlabs?.length
      ? (product as any).bulkDiscountSlabs.map((s: { min_qty: number; discount_percent: number }, i: number) => ({
          id: String(i + 1),
          minQty: s.min_qty,
          discountPercent: s.discount_percent,
        }))
      : [{ id: "1", minQty: 1, discountPercent: 0 }]
  );
  const [discountPercent, setDiscountPercent] = useState<number>((product as any)?.discountPercent ?? 0);
  const [sellingPrice, setSellingPrice] = useState<string>((product as any)?.sellingPrice != null ? String((product as any).sellingPrice) : "");
  const [gstRate, setGstRate] = useState<number>((product as any)?.gstRate ?? 18);
  const [brand, setBrand] = useState<string>((product as any)?.brand ?? "");
  const [company, setCompany] = useState<string>((product as any)?.company ?? "");
  const [grade, setGrade] = useState<string>(() => {
    const p = product as any;
    if (!p?.specs || typeof p.specs !== "object") return "";
    const s = p.specs as Record<string, unknown>;
    const g = s.Grade ?? s.grade;
    return g != null ? String(g) : "";
  });

  useEffect(() => {
    if (!open) return;
    const p = product as any;
    if (p) {
      setDiscountPercent(p.discountPercent ?? 0);
      setSellingPrice(p.sellingPrice != null ? String(p.sellingPrice) : "");
      setGstRate(p.gstRate ?? 18);
      setBrand(p.brand ?? "");
      setCompany(p.company ?? "");
      const s = p.specs && typeof p.specs === "object" ? (p.specs as Record<string, unknown>) : {};
      setGrade(s.Grade != null ? String(s.Grade) : s.grade != null ? String(s.grade) : "");
      setBulkDiscountSlabs(
        p.bulkDiscountSlabs?.length
          ? p.bulkDiscountSlabs.map((s: { min_qty: number; discount_percent: number }, i: number) => ({
              id: String(i + 1),
              minQty: s.min_qty,
              discountPercent: s.discount_percent,
            }))
          : [{ id: "1", minQty: 1, discountPercent: 0 }]
      );
    } else {
      setDiscountPercent(0);
      setSellingPrice("");
      setGstRate(18);
      setBrand("");
      setCompany("");
      setGrade("");
      setBulkDiscountSlabs([{ id: "1", minQty: 1, discountPercent: 0 }]);
    }
  }, [open, product]);

  // Reset form when dialog opens or product changes (so edit shows correct values)
  useEffect(() => {
    if (!open) return;
    const p = product as any;
    const basePrice = p?.basePrice != null ? (typeof p.basePrice === "number" ? String(p.basePrice) : String(p.basePrice)) : "0";
    form.reset({
      name: p?.name || "",
      categoryId: p?.categoryId || "",
      description: p?.description || "",
      basePrice,
      vendorId: showVendorSelector ? (p?.vendorId || vendors[0]?.id ?? "") : (user?.role === "vendor" ? user?.id ?? "" : p?.vendorId || ""),
      stockQuantity: p?.stockQuantity ?? 0,
      isFeatured: showFeatureFlags ? (p?.isFeatured ?? false) : false,
      isTrending: showFeatureFlags ? (p?.isTrending ?? false) : false,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product, showVendorSelector, showFeatureFlags, vendors, user?.id, user?.role]);

  const form = useForm<InsertProduct & { isFeatured?: boolean; isTrending?: boolean }>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      categoryId: product?.categoryId || "",
      description: product?.description || "",
      basePrice: product?.basePrice ?? (typeof product?.basePrice === "number" ? String(product.basePrice) : "0"),
      vendorId: showVendorSelector ? (product?.vendorId || (vendors[0]?.id ?? "")) : (user?.role === "vendor" ? user.id : product?.vendorId || ""),
      stockQuantity: product?.stockQuantity || 0,
      isFeatured: showFeatureFlags ? (product as any)?.isFeatured ?? false : false,
      isTrending: showFeatureFlags ? (product as any)?.isTrending ?? false : false,
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["firebase", "categories"],
    queryFn: () => firebaseApi.getCategories(),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct & { specs?: Record<string, unknown>; quantitySlabs?: Array<{ min_qty: number; max_qty: number; price_per_unit: number }>; dynamicCharges?: Record<string, { rate: number; unit: string }>; bulkDiscountSlabs?: Array<{ min_qty: number; discount_percent: number }>; discountPercent?: number; sellingPrice?: number; gstRate?: number; brand?: string; company?: string; isFeatured?: boolean; isTrending?: boolean }) => {
      const payload = {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description ?? "",
        basePrice: Number(data.basePrice) || 0,
        vendorId: data.vendorId || user?.id!,
        stockQuantity: data.stockQuantity ?? 0,
        specs: data.specs ?? undefined,
        quantitySlabs: data.quantitySlabs ?? undefined,
        dynamicCharges: data.dynamicCharges ?? undefined,
        bulkDiscountSlabs: data.bulkDiscountSlabs ?? undefined,
        discountPercent: data.discountPercent ?? undefined,
        sellingPrice: data.sellingPrice ?? undefined,
        gstRate: data.gstRate ?? undefined,
        brand: data.brand ?? undefined,
        company: data.company ?? undefined,
        isFeatured: showFeatureFlags ? (data as any).isFeatured ?? false : false,
        isTrending: showFeatureFlags ? (data as any).isTrending ?? false : false,
        isActive: true,
      };
      return firebaseApi.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firebase", "products"] });
      toast({
        title: "Product created",
        description: "Product has been created successfully.",
      });
      onOpenChange(false);
      form.reset();
      setDiscountPercent(0);
      setSellingPrice("");
      setGstRate(18);
      setBrand("");
      setCompany("");
      setGrade("");
      setBulkDiscountSlabs([{ id: "1", minQty: 1, discountPercent: 0 }]);
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
    mutationFn: (data: InsertProduct & { specs?: Record<string, unknown>; quantitySlabs?: Array<{ min_qty: number; max_qty: number; price_per_unit: number }>; dynamicCharges?: Record<string, { rate: number; unit: string }>; bulkDiscountSlabs?: Array<{ min_qty: number; discount_percent: number }>; discountPercent?: number; sellingPrice?: number; gstRate?: number; brand?: string; company?: string; isFeatured?: boolean; isTrending?: boolean }) =>
      firebaseApi.updateProduct(product!.id, {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description ?? "",
        basePrice: Number(data.basePrice) || 0,
        vendorId: data.vendorId || product?.vendorId,
        stockQuantity: data.stockQuantity ?? 0,
        specs: data.specs ?? undefined,
        quantitySlabs: data.quantitySlabs ?? undefined,
        dynamicCharges: data.dynamicCharges ?? undefined,
        bulkDiscountSlabs: data.bulkDiscountSlabs ?? undefined,
        discountPercent: data.discountPercent ?? undefined,
        sellingPrice: data.sellingPrice ?? undefined,
        gstRate: data.gstRate ?? undefined,
        brand: data.brand ?? undefined,
        company: data.company ?? undefined,
        ...(showFeatureFlags && { isFeatured: (data as any).isFeatured ?? false, isTrending: (data as any).isTrending ?? false }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firebase", "products"] });
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
    // Build specs object (include Grade for storefront filter)
    const specs: Record<string, string> = {};
    specifications.forEach((spec) => {
      if (spec.name && spec.value) {
        specs[spec.name] = spec.value;
      }
    });
    if (grade.trim()) specs.Grade = grade.trim();

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

    const bulkSlabs =
      bulkDiscountSlabs.filter((s) => s.minQty >= 0 && s.discountPercent >= 0).length > 0
        ? bulkDiscountSlabs
            .filter((s) => s.minQty >= 0 && s.discountPercent > 0)
            .map((s) => ({ min_qty: s.minQty, discount_percent: s.discountPercent }))
        : undefined;
    const sellingPriceNum = sellingPrice.trim() ? Number(sellingPrice) : undefined;

    const productData = {
      ...data,
      specs: Object.keys(specs).length > 0 ? specs : null,
      quantitySlabs: quantitySlabs.length > 0 ? quantitySlabs : null,
      dynamicCharges: Object.keys(dynamicChargesObj).length > 0 ? dynamicChargesObj : null,
      bulkDiscountSlabs: bulkSlabs,
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      sellingPrice: sellingPriceNum,
      gstRate: gstRate >= 0 ? gstRate : undefined,
      brand: brand.trim() || undefined,
      company: company.trim() || undefined,
      ...(showFeatureFlags && { isFeatured: (data as any).isFeatured ?? false, isTrending: (data as any).isTrending ?? false }),
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

  const addBulkDiscountSlab = () => {
    setBulkDiscountSlabs([
      ...bulkDiscountSlabs,
      { id: Date.now().toString(), minQty: 1, discountPercent: 0 },
    ]);
  };

  const removeBulkDiscountSlab = (id: string) => {
    setBulkDiscountSlabs(bulkDiscountSlabs.filter((s) => s.id !== id));
  };

  const addPresetCharge = (preset: { name: string; rate: number; unit: string }) => {
    setDynamicCharges((prev) => [
      ...prev.filter((c) => c.name || c.rate || c.unit),
      { id: Date.now().toString(), name: preset.name, rate: preset.rate, unit: preset.unit },
    ]);
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
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <FormLabel className="text-sm">Brand</FormLabel>
                      <Input
                        placeholder="e.g. UltraTech, ACC"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">Shows in storefront &quot;All brands&quot; filter</p>
                    </div>
                    <div>
                      <FormLabel className="text-sm">Company / Manufacturer</FormLabel>
                      <Input
                        placeholder="Optional"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <FormLabel className="text-sm">Grade</FormLabel>
                      <Input
                        placeholder="e.g. 43, 53, OPC"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">Shows in storefront &quot;All grades&quot; filter</p>
                    </div>
                  </div>

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
                            value={field.value || 0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                    <div>
                      <FormLabel className="text-sm">Discount (%)</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        placeholder="0"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">Product-level discount 0–100%</p>
                    </div>
                    <div>
                      <FormLabel className="text-sm">Selling price (₹)</FormLabel>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="Leave blank to use base price"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Override price per unit; blank = use base (or base − discount)</p>
                    </div>
                    <div>
                      <FormLabel className="text-sm">GST rate (%)</FormLabel>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        placeholder="18"
                        value={gstRate}
                        onChange={(e) => setGstRate(Number(e.target.value) ?? 18)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">e.g. 18 for 18% GST</p>
                    </div>
                  </div>

                  {showVendorSelector && vendors.length > 0 && (
                    <FormField
                      control={form.control}
                      name="vendorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vendor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {showFeatureFlags && (
                    <div className="flex gap-6 pt-2 border-t">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Featured Product</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isTrending"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Trending Product</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
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

            {/* Bulk discount by quantity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md">Bulk discount by quantity</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBulkDiscountSlab}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add slab
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">e.g. 5% off when min qty ≥ 100</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {bulkDiscountSlabs.map((slab, index) => (
                  <div key={slab.id} className="grid grid-cols-3 gap-3 p-4 border rounded-lg items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min quantity</label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="100"
                        value={slab.minQty}
                        onChange={(e) => {
                          const next = [...bulkDiscountSlabs];
                          next[index].minQty = Number(e.target.value) || 0;
                          setBulkDiscountSlabs(next);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        placeholder="5"
                        value={slab.discountPercent}
                        onChange={(e) => {
                          const next = [...bulkDiscountSlabs];
                          next[index].discountPercent = Number(e.target.value) || 0;
                          setBulkDiscountSlabs(next);
                        }}
                      />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeBulkDiscountSlab(slab.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dynamic Charges (Hamali, Transportation, etc.) */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-md">Specific charges (Hamali, Transportation, etc.)</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {DYNAMIC_CHARGE_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPresetCharge(preset)}
                      >
                        + {preset.name}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDynamicCharge}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Custom
                    </Button>
                  </div>
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
