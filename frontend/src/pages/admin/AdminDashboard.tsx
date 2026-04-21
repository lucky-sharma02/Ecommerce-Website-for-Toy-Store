import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Dialog, DialogContent, DialogDescription, 
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Package, ShoppingCart, Users, Plus, 
  TrendingUp, CheckCircle2, Truck, Loader2, Edit3, Trash2, AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

// Validation Schema
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  bulk_discount_percent: z.coerce.number().min(0, 'Discount must be at least 0%').max(99, 'Discount cannot exceed 99%'),
  bulk_min_quantity: z.coerce.number().min(2, 'Min bulk quantity must be at least 2'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  image_url: z.string().url('Must be a valid URL'),
  category_id: z.coerce.number().min(1, 'Category is required'),
});

const categorySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;
type CategoryFormValues = z.infer<typeof categorySchema>;

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Queries
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/analytics');
      return response.data;
    },
  });

  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders/all');
      return response.data;
    },
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await apiClient.get('/products/');
      return response.data;
    },
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories/');
      return response.data;
    },
  });

  // Form Setup
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  // Mutations
  const productMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (editingProduct) {
        return await apiClient.put(`/products/${editingProduct.id}`, data);
      }
      return await apiClient.post('/products/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      closeProductModal();
    },
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      if (editingCategory) {
        return await apiClient.put(`/categories/${editingCategory.id}`, data);
      }
      return await apiClient.post('/categories/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(editingCategory ? 'Category updated' : 'Category created');
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product soft-deleted');
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiClient.put(`/orders/${id}`, { order_status: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
  });

  // Handlers
  const openEditModal = (product: any) => {
    setEditingProduct(product);
    productForm.reset(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    productForm.reset({
        name: '', description: '', price: 0, bulk_discount_percent: 10, 
        bulk_min_quantity: 5, stock: 0, image_url: '', category_id: undefined
    });
  };

  const openCategoryModal = (category: any = null) => {
    setEditingCategory(category);
    if (category) categoryForm.reset(category);
    else categoryForm.reset({ name: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  if (isAnalyticsLoading || isOrdersLoading || isProductsLoading || isCategoriesLoading) {
    return (
      <Layout>
        <div className="flex-grow flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-screen pb-20">
        <main className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Command Center</h1>
                    <p className="text-gray-500">Inventory, orders, and business health.</p>
                </div>
                
                <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-lg shadow-indigo-100" onClick={() => { setEditingProduct(null); productForm.reset(); }}>
                            <Plus className="mr-2 h-4 w-4" /> Add New Toy
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                            <DialogDescription>
                                Fill in the details below. Remember that prices should be competitive!
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={productForm.handleSubmit((data) => productMutation.mutate(data))} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input id="name" {...productForm.register('name')} placeholder="e.g. Robot Hero" />
                                    {productForm.formState.errors.name && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <select 
                                        id="category_id" 
                                        {...productForm.register('category_id')}
                                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select Category</option>
                                        {categories?.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {productForm.formState.errors.category_id && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.category_id.message}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...productForm.register('description')} placeholder="Detail what makes this toy special..." className="min-h-[100px]" />
                                {productForm.formState.errors.description && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" type="number" step="0.01" {...productForm.register('price')} />
                                    {productForm.formState.errors.price && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.price.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bulk_discount_percent">Bulk Discount (%)</Label>
                                    <Input id="bulk_discount_percent" type="number" step="0.1" {...productForm.register('bulk_discount_percent')} />
                                    {productForm.formState.errors.bulk_discount_percent && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.bulk_discount_percent.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bulk_min_quantity">Min Bulk</Label>
                                    <Input id="bulk_min_quantity" type="number" {...productForm.register('bulk_min_quantity')} />
                                    {productForm.formState.errors.bulk_min_quantity && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.bulk_min_quantity.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input id="stock" type="number" {...productForm.register('stock')} />
                                    {productForm.formState.errors.stock && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.stock.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image_url">Image URL</Label>
                                <Input id="image_url" {...productForm.register('image_url')} placeholder="https://unsplash.com/..." />
                                {productForm.formState.errors.image_url && <p className="text-xs text-red-500 font-medium">{productForm.formState.errors.image_url.message}</p>}
                            </div>

                            <DialogFooter className="pt-6">
                                <Button type="button" variant="ghost" onClick={closeProductModal}>Cancel</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8" disabled={productMutation.isPending}>
                                    {productMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingProduct ? 'Update Product' : 'Save Product'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white border p-1 rounded-xl shadow-sm w-full md:w-max flex overflow-x-auto h-auto">
                <TabsTrigger value="overview" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm">
                <BarChart3 className="mr-2 h-4 w-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="orders" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm">
                <ShoppingCart className="mr-2 h-4 w-4" /> Orders
                </TabsTrigger>
                <TabsTrigger value="products" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm">
                <Package className="mr-2 h-4 w-4" /> Products
                </TabsTrigger>
                <TabsTrigger value="categories" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Categories
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 mt-0 outline-none">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Sales', value: `$${analytics?.total_sales.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { title: 'Total Orders', value: analytics?.total_orders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Active Products', value: analytics?.total_products, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { title: 'Customers', value: analytics?.total_customers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat) => (
                    <Card key={stat.title} className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                        <div className={`${stat.bg} p-3 rounded-2xl`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>

                {/* Top Products */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                    <CardTitle className="text-lg font-bold">Top Performing Toys</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                    {analytics?.top_products.map((product: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                            {idx + 1}
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                            {product.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-gray-900">{product.quantity} sold</span>
                            <div className="w-24 sm:w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(product.quantity / analytics.top_products[0].quantity) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-indigo-600 rounded-full" 
                            />
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-0 outline-none">
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders?.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-mono text-xs text-gray-400">#{order.id}</td>
                            <td className="p-4">
                            <p className="text-sm font-bold text-gray-900">User #{order.user_id}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{order.shipping_address}</p>
                            </td>
                            <td className="p-4 font-black text-indigo-600">${order.total_price.toFixed(2)}</td>
                            <td className="p-4">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                ${order.order_status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                order.order_status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                'bg-amber-100 text-amber-800'}`}
                            >
                                {order.order_status.toUpperCase()}
                            </div>
                            </td>
                            <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 text-nowrap">
                                <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 px-4 rounded-lg border-gray-200"
                                onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'shipped' })}
                                disabled={order.order_status !== 'placed'}
                                >
                                <Truck className="h-3.5 w-3.5 mr-2" /> Ship
                                </Button>
                                <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 px-4 rounded-lg border-gray-200"
                                onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'delivered' })}
                                disabled={order.order_status !== 'shipped'}
                                >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Deliver
                                </Button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </Card>
            </TabsContent>
            
            <TabsContent value="products" className="mt-0 outline-none">
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price (Bulk)</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products?.map((product: any) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-gray-100" />
                                    <span className="text-sm font-bold text-gray-900">{product.name}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="text-xs font-medium bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-600 uppercase tracking-wider">
                                    {product.category_rel?.name || 'Uncategorized'}
                                </span>
                            </td>
                            <td className="p-4 font-bold text-indigo-600">
                                ${product.price} <span className="text-gray-400 text-[10px]">({product.bulk_discount_percent}% bulk disc.)</span>
                            </td>
                            <td className="p-4">
                                <div className={`flex items-center gap-2 text-sm font-black ${product.stock < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                                    {product.stock}
                                    {product.stock < 10 && <AlertCircle className="h-3 w-3" />}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-indigo-600" onClick={() => openEditModal(product)}>
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-red-500" onClick={() => deleteProductMutation.mutate(product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </Card>
            </TabsContent>

            <TabsContent value="categories" className="mt-0 outline-none">
                <div className="flex justify-end mb-4">
                    <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => openCategoryModal()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={categoryForm.handleSubmit((data) => categoryMutation.mutate(data))} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cat_name">Name</Label>
                                    <Input id="cat_name" {...categoryForm.register('name')} />
                                    {categoryForm.formState.errors.name && <p className="text-xs text-red-500">{categoryForm.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cat_desc">Description</Label>
                                    <Textarea id="cat_desc" {...categoryForm.register('description')} />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={categoryMutation.isPending}>
                                        {categoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categories?.map((cat: any) => (
                        <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                                <span className="text-sm font-bold text-gray-900">{cat.name}</span>
                                <p className="text-xs text-gray-500">{cat.description}</p>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2 text-nowrap">
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-indigo-600" onClick={() => openCategoryModal(cat)}>
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-400 hover:text-red-500" onClick={() => {
                                        if (confirm('Delete this category?')) {
                                            apiClient.delete(`/categories/${cat.id}`).then(() => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }));
                                        }
                                    }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </Card>
            </TabsContent>
            </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
