import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const ProductSkeleton = () => {
  return (
    <Card className="overflow-hidden border-none shadow-sm animate-pulse flex flex-col h-full bg-white">
      <div className="aspect-square bg-gray-200" />
      <CardContent className="p-4 flex-grow">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full mb-1" />
        <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/4 mt-auto" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-10 bg-gray-200 rounded w-full" />
      </CardFooter>
    </Card>
  );
};

export const ProductsGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export default ProductSkeleton;
