import React, { useState, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ToyBrick, SearchX, ShoppingBag, ArrowRight, Loader2, 
    Sparkles, Filter, SlidersHorizontal, ChevronDown, 
    SortAsc, SortDesc, Calendar, Tag
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { ProductsGridSkeleton } from '@/components/ProductSkeleton';
import Layout from '@/components/Layout';
import { 
    Tabs, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Icons are now handled dynamically in the UI

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category_id') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortBy = searchParams.get('sort_by') || 'newest';

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories/');
      return response.data;
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['products', selectedCategoryId, searchQuery, minPrice, maxPrice, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      let url = `/products/?skip=${pageParam}&limit=8`;
      if (selectedCategoryId !== 'all') url += `&category_id=${selectedCategoryId}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (minPrice) url += `&min_price=${minPrice}`;
      if (maxPrice) url += `&max_price=${maxPrice}`;
      if (sortBy) url += `&sort_by=${sortBy}`;
      
      const response = await apiClient.get(url);
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 8) return undefined;
      return allPages.length * 8;
    },
  });

  const products = data?.pages.flat() || [];

  const updateParam = (key: string, value: string | null) => {
    if (!value) searchParams.delete(key);
    else searchParams.set(key, value);
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (value: string) => {
      updateParam('category_id', value === 'all' ? null : value);
  };

  return (
    <Layout>
      {/* Hero Section - Only shown for non-authenticated users */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden bg-white border-b border-gray-50"
          >
            <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-6"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    NEW ARRIVALS NOW IN STOCK
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900"
                  >
                    Discover the <span className="text-indigo-600">Magic</span> of Play
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-500 max-w-lg mb-8 leading-relaxed"
                  >
                    From epic action figures to mind-bending board games, find the perfect toy for every age and interest. Premium quality, endless joy.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-4"
                  >
                    <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200">
                      Explore Collection
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
                <div className="flex-1 relative hidden md:block">
                   <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10"
                   >
                     <img 
                       src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=800&auto=format&fit=crop" 
                       alt="Hero Toys" 
                       className="rounded-3xl shadow-2xl"
                     />
                     <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-600 text-white p-2 rounded-lg">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold">Orders today</p>
                            <p className="text-xl font-extrabold">2.4k+</p>
                          </div>
                        </div>
                     </div>
                   </motion.div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-50 rounded-full -z-10 blur-3xl opacity-50" />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Advanced Filters & Tabs */}
        <div className="space-y-8 mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                        {searchQuery 
                            ? `Search: "${searchQuery}"` 
                            : selectedCategoryId === 'all' 
                                ? 'Our Entire Collection' 
                                : categoriesData?.find((c: any) => c.id.toString() === selectedCategoryId)?.name}
                    </h2>
                    <p className="text-gray-500 font-medium">Discover premium toys for every imagination.</p>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 px-5 rounded-xl border-gray-200 font-bold gap-2 hover:bg-gray-50">
                                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                                {sortBy === 'newest' ? 'Newest Arrivals' : sortBy === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-gray-400 tracking-widest px-2 py-1.5">Sort by</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-lg font-bold py-2 cursor-pointer" onClick={() => updateParam('sort_by', 'newest')}>
                                <Calendar className="h-4 w-4 mr-2 text-indigo-600" /> Newest Arrivals
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold py-2 cursor-pointer" onClick={() => updateParam('sort_by', 'price_asc')}>
                                <SortAsc className="h-4 w-4 mr-2 text-indigo-600" /> Price: Low to High
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg font-bold py-2 cursor-pointer" onClick={() => updateParam('sort_by', 'price_desc')}>
                                <SortDesc className="h-4 w-4 mr-2 text-indigo-600" /> Price: High to Low
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 px-5 rounded-xl border-gray-200 font-bold gap-2 hover:bg-gray-50">
                                <Tag className="h-4 w-4 text-indigo-600" />
                                Price Range
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 p-6 rounded-2xl">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-gray-900">Price Filter</span>
                                    {(minPrice || maxPrice) && (
                                        <Button variant="ghost" className="h-7 px-2 text-[10px] uppercase font-black text-indigo-600 hover:bg-indigo-50" onClick={() => { updateParam('min_price', null); updateParam('max_price', null); }}>
                                            Reset
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min ($)</Label>
                                        <Input type="number" placeholder="0" value={minPrice} onChange={(e) => updateParam('min_price', e.target.value)} className="h-10 rounded-lg" />
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max ($)</Label>
                                        <Input type="number" placeholder="500" value={maxPrice} onChange={(e) => updateParam('max_price', e.target.value)} className="h-10 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs value={selectedCategoryId} onValueChange={handleCategoryChange} className="w-full">
                <div className="flex items-center justify-between border-b border-gray-100">
                    <TabsList className="h-auto p-0 bg-transparent gap-8 overflow-x-auto pb-px">
                        <TabsTrigger value="all" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 py-4 font-black text-sm bg-transparent transition-all hover:text-indigo-600">
                            EVERYTHING
                        </TabsTrigger>
                        {categoriesData?.map((cat: any) => (
                            <TabsTrigger key={cat.id} value={cat.id.toString()} className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-0 py-4 font-black text-sm bg-transparent transition-all hover:text-indigo-600 uppercase">
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-400 tracking-widest">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {products.length} {products.length === 1 ? 'PRODUCT' : 'PRODUCTS'} AVAILABLE
                    </div>
                </div>
            </Tabs>
        </div>

        {isLoading ? (
          <ProductsGridSkeleton count={8} />
        ) : isError ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
             <p className="text-red-600 font-bold mb-4">Something went wrong while loading toys.</p>
             <Button onClick={() => refetch()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-100">Try Again</Button>
          </div>
        ) : (
          <>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence>
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {products.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200"
              >
                <SearchX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No toys found</h3>
                <p className="text-gray-500 mb-8">Try adjusting your filters or search terms.</p>
                <Button onClick={() => setSearchParams({})} variant="outline">Clear Filters</Button>
              </motion.div>
            )}

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-16 text-center">
                <Button 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-10 h-12 rounded-xl font-bold text-lg"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading More...
                    </>
                  ) : 'Load More Magic'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
