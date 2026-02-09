import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseApi } from "@/lib/firebase-api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CategoryForm } from "@/components/categories/category-form";
import { type Category } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceSearchInput } from "@/components/ui/voice-search-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FolderTree, Search, Filter, Globe } from "lucide-react";

export default function Categories() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deletingCategory, setDeletingCategory] = useState<Category | undefined>();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["firebase", "categories"],
    queryFn: () => firebaseApi.getCategories(),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => firebaseApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firebase", "categories"] });
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      });
      setDeletingCategory(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const seedIndiaMutation = useMutation({
    mutationFn: () => firebaseApi.seedIndiaCategories(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["firebase", "categories"] });
      toast({
        title: "India categories seeded",
        description: `Created ${result.created}, skipped ${result.skipped} (already exist).`,
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to seed categories",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return "None";
    const parent = categories?.find((c: Category) => c.id === parentId);
    return parent?.name || "Unknown";
  };

  const getSubcategoriesCount = (categoryId: string) => {
    return categories?.filter((c: Category) => c.parentId === categoryId).length || 0;
  };

  // Filter categories based on search and parent filter
  const filteredCategories = categories?.filter((category: Category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getParentCategoryName(category.parentId).toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesParentFilter = true;
    if (parentFilter === "root") {
      matchesParentFilter = !category.parentId;
    } else if (parentFilter === "sub") {
      matchesParentFilter = !!category.parentId;
    } else if (parentFilter !== "all") {
      matchesParentFilter = category.parentId === parentFilter;
    }
    
    return matchesSearch && matchesParentFilter;
  }) || [];

  const rootCategories = categories?.filter((c: Category) => !c.parentId).length || 0;
  const subCategories = categories?.filter((c: Category) => c.parentId).length || 0;

  const canEditCategories = isAdmin;

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Categories"
          subtitle="Manage product categories and hierarchy"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-gray-900">
                  All Categories ({filteredCategories.length}/{categories?.length || 0})
                </h3>
              </div>
              
              {canEditCategories && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => seedIndiaMutation.mutate()}
                    disabled={seedIndiaMutation.isPending}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Seed India categories
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <VoiceSearchInput
                  placeholder="Search categories by name, description, or parent..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  testId="input-search-categories"
                />
              </div>
              
              <Select value={parentFilter} onValueChange={setParentFilter}>
                <SelectTrigger className="w-full lg:w-64">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="root">Root Categories</SelectItem>
                  <SelectItem value="sub">Subcategories</SelectItem>
                  {categories?.filter((c: Category) => !c.parentId).map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      Children of {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Categories</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {categories?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Parent Categories</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {categories?.filter((c: Category) => !c.parentId).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Subcategories</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {categories?.filter((c: Category) => c.parentId).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories Table */}
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parent Category</TableHead>
                      <TableHead>Subcategories</TableHead>
                      <TableHead>Status</TableHead>
                      {canEditCategories && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category: Category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {category.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.parentId ? "secondary" : "default"}>
                            {getParentCategoryName(category.parentId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getSubcategoriesCount(category.id)} subcategories
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "destructive"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {canEditCategories && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingCategory(category)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {!filteredCategories.length && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm || parentFilter !== "all" ? 
                        "No categories found matching your criteria" :
                        "No categories found."
                      }
                    </p>
                    {canEditCategories && !searchTerm && parentFilter === "all" && (
                      <Button
                        className="mt-2"
                        onClick={() => setShowCreateModal(true)}
                      >
                        Create your first category
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create/Edit Category Modal */}
      {canEditCategories && (
        <CategoryForm
          open={showCreateModal || !!editingCategory}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateModal(false);
              setEditingCategory(undefined);
            }
          }}
          category={editingCategory}
        />
      )}

      {/* Delete Confirmation Modal */}
      {canEditCategories && (
        <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(undefined)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
                {getSubcategoriesCount(deletingCategory?.id || "") > 0 && (
                  <span className="block mt-2 text-orange-600">
                    Warning: This category has {getSubcategoriesCount(deletingCategory?.id || "")} subcategories that will also be affected.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={() => setDeletingCategory(undefined)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletingCategory && deleteCategoryMutation.mutate(deletingCategory.id)}
                disabled={deleteCategoryMutation.isPending}
              >
                Delete Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
