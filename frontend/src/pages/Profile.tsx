import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    User, ShoppingBag, Package, MapPin, 
    Calendar, CreditCard, ChevronRight, Loader2, Clock, Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { 
    Dialog, DialogContent, DialogDescription, 
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        full_name: user?.full_name || '',
        email: user?.email || '',
    }
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders/');
      return response.data;
    },
  });

  const onUpdateProfile = async (data: ProfileFormValues) => {
      try {
          await apiClient.put(`/users/${user?.id}`, data);
          await refreshUser();
          toast.success('Profile updated successfully');
          setIsEditModalOpen(false);
      } catch (error: any) {
          toast.error(error.response?.data?.detail || 'Failed to update profile');
      }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-500 text-lg">Manage your profile, view orders, and track deliveries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
             <Card className="border-none shadow-lg overflow-hidden bg-white">
                <div className="h-24 bg-indigo-600 w-full" />
                <CardContent className="px-6 pb-6 pt-0 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full -mt-10 flex items-center justify-center border-4 border-white shadow-md text-indigo-600 mb-4">
                        <User className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 text-center">{user.full_name}</h2>
                    <p className="text-sm text-gray-400 text-center mb-6">{user.email}</p>
                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                            Registered Oct 2024
                        </div>
                    </div>
                </CardContent>
             </Card>
             
             <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline" className="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-gray-200 rounded-xl mt-4">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Account Settings
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>Update your personal information here.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input id="full_name" {...register('full_name')} />
                                    {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" {...register('email')} />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                     </Dialog>
                  </div>

          {/* Main Content Areas */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-8">
                    <TabsTrigger value="orders" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 py-3 font-bold text-sm bg-transparent">
                        Order History
                    </TabsTrigger>
                    <TabsTrigger value="addresses" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 py-3 font-bold text-sm bg-transparent">
                        Saved Addresses
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="mt-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : orders?.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                             <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                             <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
                             <p className="text-gray-500">Your future magical toys will appear here!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders?.map((order: any) => (
                                <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden bg-white">
                                    <CardContent className="p-0">
                                        <div className="border-b bg-gray-50/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                                            <div className="flex gap-6">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Date Placed</p>
                                                    <p className="text-sm font-bold text-gray-700">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Total Amount</p>
                                                    <p className="text-sm font-bold text-gray-700">${order.total_price.toFixed(2)}</p>
                                                </div>
                                                <div className="hidden sm:block">
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Ship To</p>
                                                    <p className="text-sm font-bold text-gray-700 max-w-[150px] truncate">{order.shipping_address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    order.order_status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                                    order.order_status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {order.order_status.toUpperCase()}
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            {/* Preview of items (just showing IDs/names for simplicity) */}
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                   <ShoppingBag className="h-8 w-8 opacity-20" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">Order #{order.id}</h4>
                                                    <p className="text-xs text-gray-500">Tracking Code: {order.payment_id.slice(0, 12)}...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="addresses">
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="p-8 text-center">
                            <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Address management coming in next update.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
