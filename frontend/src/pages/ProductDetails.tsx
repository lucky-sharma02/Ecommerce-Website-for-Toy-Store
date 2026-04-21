import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
    ShoppingCart, ArrowLeft, Tag, ShieldCheck, 
    Truck, RefreshCw, Star, Plus, Minus, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/cart/', {
        product_id: Number(id),
        quantity: quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart!`);
    },
    onError: () => {
      toast.error('Could not add to cart. Please login first.');
      navigate('/login');
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toy Not Found</h2>
          <Button onClick={() => navigate('/')} variant="outline">Back to Catalog</Button>
        </div>
      </Layout>
    );
  }

  // Price is now constant per unit
  const currentPrice = product.price;
  const isBulk = quantity >= product.bulk_min_quantity;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 hover:bg-gray-100 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-xl">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
              />
            </div>
          </motion.div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 mb-4 px-3 py-1">
                {product.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                 <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                 </div>
                 <span className="text-sm text-gray-400 font-medium">(24 Customer Reviews)</span>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-extrabold text-indigo-600">${product.price.toFixed(2)}</span>
                <span className="text-lg text-gray-400 line-through">${(product.price * 1.2).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                <Tag className="h-4 w-4" />
                -{product.bulk_discount_percent}% Volume Discount applied on total for {product.bulk_min_quantity}+ units
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-lg italic">
              "{product.description}"
            </p>

            <Separator />

            {/* Quantity and CTA */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-1 bg-gray-50 border rounded-xl p-1.5 w-max">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-lg hover:bg-white transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-extrabold text-lg">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-lg hover:bg-white transition-colors"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm font-medium text-gray-500">
                    <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                        {product.stock} units
                    </span> available in stock
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                    className="flex-grow bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-100 gap-3"
                    onClick={() => addToCartMutation.mutate()}
                    disabled={product.stock <= 0 || addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-6 w-6" />}
                  {product.stock > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}
                </Button>
              </div>
            </div>

            {/* Trust Badges (Amazon style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Fast Delivery</h4>
                  <p className="text-xs text-gray-500">Ships within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Easy Returns</h4>
                  <p className="text-xs text-gray-500">30-day money back</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4>
                  <p className="text-xs text-gray-500">100% encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
