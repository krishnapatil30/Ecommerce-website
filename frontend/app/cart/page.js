"use client";
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">YOUR CART IS EMPTY.</h1>
        <p className="text-gray-500 mb-8 max-w-xs font-medium">Time to upgrade your setup with some elite peripherals.</p>
        <Button asChild className="bg-black hover:bg-blue-600 rounded-2xl px-8 py-6 text-base font-bold transition-all">
          <Link href="/">Explore Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="flex items-center gap-4 mb-12">
           <Link href="/" className="p-3 bg-white rounded-full border border-gray-100 hover:border-black transition-all">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Shopping Bag</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Side: Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <Card key={item.id} className="border-none shadow-none rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-32 h-32 bg-[#F9F9F9] rounded-2xl flex-shrink-0 p-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    </div>
                    
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-xl font-black text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">In Stock</p>
                      <div className="flex items-center justify-center sm:justify-start gap-4">
                        <span className="text-gray-400 text-sm font-medium">Qty: {item.quantity}</span>
                        <span className="text-gray-200">|</span>
                        <span className="text-gray-900 font-black">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <button 
              onClick={clearCart}
              className="text-gray-400 text-xs font-black uppercase tracking-widest hover:text-black ml-4"
            >
              Empty Cart
            </button>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-1 sticky top-24">
            <Card className="border-none shadow-2xl shadow-blue-500/5 rounded-[2.5rem] bg-white p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                </div>
                <div className="h-[1px] bg-gray-100 my-4" />
                <div className="flex justify-between text-2xl font-black text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button 
                onClick={() => router.push('/checkout')}
                className="w-full bg-black hover:bg-blue-600 text-white py-8 rounded-[1.5rem] font-black text-lg shadow-xl transition-all active:scale-95"
              >
                Proceed to Checkout
              </Button>
              
              <p className="text-[10px] text-gray-400 text-center mt-6 font-medium px-4">
                Secure SSL Encrypted Payment. <br/>Elite Tech Guarantee Included.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}