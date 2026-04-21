import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
    Loader2, Lock, CheckCircle2, ShoppingBag, 
    Truck, ArrowLeft, House, PackageSearch, PackageOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ clientSecret, totalPrice, shippingAddress }: { clientSecret: string; totalPrice: number; shippingAddress: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !shippingAddress.trim()) {
      if (!shippingAddress.trim()) toast.error('Please enter a shipping address');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful, now create the order on our backend
        const response = await apiClient.post(`/orders/verify-payment/${paymentIntent.id}?shipping_address=${encodeURIComponent(shippingAddress)}`);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        navigate(`/checkout?success=true&orderId=${response.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="mb-6" />
      <Button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl text-lg font-black shadow-lg shadow-indigo-100 gap-3"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            PROCESSING SECURELY...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            PAY ${totalPrice.toFixed(2)} NOW
          </>
        )}
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
         <Lock className="h-3 w-3" />
         Encrypted with 256-bit SSL
      </div>
    </form>
  );
};

const SuccessState = ({ orderId }: { orderId: string | null }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 px-4 text-center"
    >
        <div className="relative mb-12 flex justify-center">
             <div className="absolute inset-0 bg-green-100 rounded-full blur-3xl opacity-50 scale-150 animate-pulse" />
             <div className="relative bg-white p-8 rounded-full shadow-2xl border-8 border-green-50">
                <CheckCircle2 className="h-24 w-24 text-green-500" />
             </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Order Confirmed!</h1>
        <p className="text-xl text-gray-500 mb-12 leading-relaxed">
            Woohoo! Your magical toys are being prepared for their grand journey. 
            We've sent a confirmation email your way.
        </p>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
            <div className="flex flex-col sm:flex-row justify-around gap-8">
                <div className="text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Order Number</p>
                    <p className="text-2xl font-black text-indigo-600">#{orderId || 'N/A'}</p>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-12" />
                <div className="text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                    <p className="text-2xl font-black text-gray-900">2-3 Business Days</p>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/profile">
                <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-100 gap-2">
                    <PackageSearch className="h-5 w-5" />
                    Track Order
                </Button>
            </Link>
            <Link to="/">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-bold text-lg gap-2">
                    <House className="h-5 w-5" />
                    Back to Shop
                </Button>
            </Link>
        </div>
    </motion.div>
);

const Checkout = () => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');

  const { data: paymentData, isLoading, isError, error } = useQuery({
    queryKey: ['payment-intent'],
    queryFn: async () => {
      const response = await apiClient.post('/orders/create-payment-intent');
      return response.data;
    },
    enabled: !isSuccess,
    retry: false
  });

  if (isSuccess) return <Layout><SuccessState orderId={orderId} /></Layout>;

  if (isLoading) return <Layout><div className="py-32 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div></Layout>;
  
  if (isError) {
      const errorData = (error as any)?.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || 'Your session may have expired or your cart is empty.';
      return (
          <Layout>
              <div className="py-32 text-center max-w-md mx-auto px-4">
                  <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col items-center">
                    <PackageOpen className="h-16 w-16 text-red-200 mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Checkout Unavailable</h2>
                    <p className="text-gray-500 mb-8">{errorMessage}</p>
                    <div className="flex gap-4 w-full">
                        <Link to="/cart" className="flex-1">
                            <Button variant="outline" className="w-full h-12 rounded-xl">Return to Cart</Button>
                        </Link>
                        <Link to="/" className="flex-1">
                            <Button className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700">Shop Now</Button>
                        </Link>
                    </div>
                  </div>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <Button variant="ghost" className="mb-8 hover:bg-gray-100 -ml-2" asChild>
                <Link to="/cart">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Delivery Info */}
            <div className="space-y-8">
                <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Final Step: Delivery</h1>
                <p className="text-gray-500 font-medium">Where should we send your magical toys?</p>
                </div>

                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-bold text-gray-700">Full Shipping Address</Label>
                    <Input 
                        id="address" 
                        placeholder="Street, City, Zip Code, Country" 
                        className="h-12 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                    />
                </div>
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                    <Truck className="h-6 w-6 text-indigo-600" />
                    <div>
                        <h4 className="font-bold text-gray-900">Complimentary Global Shipping</h4>
                        <p className="text-sm text-gray-500">Your order qualifies for our elite free delivery service.</p>
                    </div>
                </div>
            </div>

            {/* Payment Section */}
            <div>
                <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden sticky top-24">
                <CardHeader className="bg-indigo-600 text-white p-8">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-black">Order Checkout</CardTitle>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm underline decoration-white/30 decoration-2">
                            ${paymentData.total_price.toFixed(2)}
                        </div>
                    </div>
                    <CardDescription className="text-indigo-100 font-medium pt-1">
                        Secure 128-bit Encrypted Transaction
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <Elements stripe={stripePromise} options={{ clientSecret: paymentData.client_secret }}>
                        <CheckoutForm 
                            clientSecret={paymentData.client_secret} 
                            totalPrice={paymentData.total_price}
                            shippingAddress={shippingAddress}
                        />
                    </Elements>
                </CardContent>
                </Card>
            </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;

// This helper is needed since useSearchParams was used in the previous version but not imported in this thinking step
import { useSearchParams } from 'react-router-dom';
