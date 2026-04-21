import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Tag, ShoppingCart, Eye } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  bulk_discount_percent: number;
  bulk_min_quantity: number;
  stock: number;
  image_url: string;
  category_id?: number;
  category_rel?: {
      id: number;
      name: string;
  };
}
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};
const ProductCard = ({ product }: { product: Product }) => {
  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to details
    try {
      await apiClient.post('/cart/', {
        product_id: product.id,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart. Please login first.');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link to={`/products/${product.id}`} className="block h-full group">
        <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow bg-white h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay Category */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 shadow-sm uppercase tracking-wider">
              {product.category_rel?.name || 'Toy'}
            </div>
            
            {/* Quick View Button (Visible on Hover) */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur rounded-full shadow-lg pointer-events-none">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
          
          <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed mb-4">
              {product.description}
            </p>
            
            <div className="mt-auto space-y-3">
             <div className="flex items-baseline gap-2">
  <span className="text-xl font-extrabold text-indigo-600">
    {formatPrice(product.price)}
  </span>

  <span className="text-xs text-gray-400 line-through">
    {formatPrice(product.price * 1.2)}
  </span>
</div>
              
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 w-max">
                <Tag className="h-3 w-3" />
                -{product.bulk_discount_percent}% Volume Discount on {product.bulk_min_quantity}+ items
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button 
              className="w-full bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white shadow-sm gap-2 h-10 rounded-xl transition-all"
              onClick={addToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock > 0 ? 'Quick Add' : 'Out of Stock'}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
