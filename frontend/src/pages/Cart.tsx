import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, ShieldCheck, AlertCircle, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Separator } from '@/components/ui/separator';


const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

const Cart = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.get('/cart/');
      return response.data;
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiClient.put(`/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
  });

  const calculateTotal = () => {
    if (!cartItems) return { gross: 0, discount: 0, final: 0 };
    return cartItems.reduce((acc: any, item: any) => {
      const product = item?.product;
      if (!product) return acc;
      
      const itemGross = product.price * item.quantity;
      const isBulk = item.quantity >= product.bulk_min_quantity;
      const itemDiscount = isBulk ? (itemGross * (product.bulk_discount_percent / 100)) : 0;
      
      return {
        gross: acc.gross + itemGross,
        discount: acc.discount + itemDiscount,
        final: acc.final + (itemGross - itemDiscount)
      };
    }, { gross: 0, discount: 0, final: 0 });
  };

  const { gross, discount, final: total } = calculateTotal();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-screen">
        <main className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-12">
                <div className="bg-white p-3 rounded-2xl shadow-sm border">
                    <ShoppingBag className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                   <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Bag</h1>
                   <p className="text-gray-500 font-medium">{cartItems?.length || 0} items ready for adventure</p>
                </div>
            </div>
            
            {cartItems?.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-sm p-20 text-center border border-dashed border-gray-200"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-50 rounded-full mb-8 text-indigo-600">
                        <ShoppingBag className="h-12 w-12" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                        Looks like you haven't added any toys to your collection yet. Let's find something magical!
                    </p>
                    <Link to="/">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 h-14 px-12 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-100">
                            Explore Toys
                        </Button>
                    </Link>
                </motion.div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-4">
                <ErrorBoundary>
                    <AnimatePresence mode="popLayout">
                        {cartItems?.map((item: any) => {
                            const product = item?.product;
                            
                            // Handle case where product might have been deleted but is still in cart
                            if (!product) {
                                return (
                                    <motion.div key={item.id} layout className="p-6 bg-red-50 border border-red-100 rounded-2xl flex justify-between items-center">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <AlertCircle className="h-5 w-5" />
                                            <span className="font-bold">This product is no longer available</span>
                                        </div>
                                        <Button variant="ghost" onClick={() => removeItemMutation.mutate(item.id)} className="text-red-500 hover:bg-red-100">
                                            Remove
                                        </Button>
                                    </motion.div>
                                );
                            }

                            const isBulk = item.quantity >= product.bulk_min_quantity;
                            const itemSubtotal = product.price * item.quantity;
                            const itemDiscount = isBulk ? (itemSubtotal * (product.bulk_discount_percent / 100)) : 0;
                            const effectivePrice = product.price; // Unit price MUST not change visually

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                >
                                    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white group">
                                        <CardContent className="p-4 sm:p-6 flex items-center gap-6">
                                            <div className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border">
                                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h3 className="text-sm sm:text-lg font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                                        <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">{product.category}</p>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-gray-300 hover:text-red-500 -mt-2 -mr-2 bg-transparent"
                                                        onClick={() => removeItemMutation.mutate(item.id)}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1 border">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 rounded-lg hover:bg-white shadow-sm"
                                                            onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                                                            disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-10 text-center font-black text-gray-900 text-lg">{item.quantity}</span>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 rounded-lg hover:bg-white shadow-sm"
                                                            onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                                                            disabled={item.quantity >= product.stock || updateQuantityMutation.isPending}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <div className="flex items-baseline justify-end gap-2">
                                                           <span className="text-2xl font-black text-gray-900">
                                                                {formatPrice(itemSubtotal)}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                                                            {formatPrice(product.price)} / UNIT
                                                        </div>
                                                        {isBulk && (
                                                            <div className="mt-1 text-[10px] font-black text-green-600 uppercase">
                                                                -{product.bulk_discount_percent}% VOLUME SAVINGS APPLIED
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </ErrorBoundary>
                </div>
                
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-none shadow-xl bg-white overflow-hidden rounded-3xl">
                        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                            <h3 className="text-2xl font-black relative z-10">Checkout Total</h3>
                            <p className="text-indigo-100 text-sm relative z-10">Secure processing via Stripe</p>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 opacity-50" />
                        </div>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900">{formatPrice(gross)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                        <span className="flex items-center gap-1.5"><Tag className="h-3 w-3" /> Volume Discount</span>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Shipping & Handling</span>
                                    <span className="text-green-600 font-black uppercase tracking-wider text-xs">FREE SHIPPING</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Estimated Taxes</span>
                                    <span className="font-bold text-gray-900">₹0.00</span>
                                </div>
                                
                                <Separator />
                                
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-900 font-black text-xl">Total</span>
                                    <span className="text-3xl font-black text-indigo-600">${total.toFixed(2)}</span>
                                </div>
                                
                                <Button 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 text-xl font-black rounded-2xl mt-6 shadow-lg shadow-indigo-100 gap-3 group transition-all"
                                    onClick={() => navigate('/checkout')}
                                >
                                    PAY AND SHIP
                                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                
                                <div className="pt-8 flex flex-col items-center gap-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">PCI Compliant Payments</span>
                                    </div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6 grayscale opacity-40 hover:grayscale-0 transition-all cursor-help" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            )}
        </main>
      </div>
    </Layout>
  );
};

export default Cart;
