"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('id');

  return (
    <div className="max-w-xl w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-green-500/5 text-center border border-gray-100">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">
        Order Confirmed
      </h1>
      <p className="text-gray-500 font-medium mb-1">
        Your payment was processed successfully.
      </p>
      
      {paymentId && (
        <div className="inline-block bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full my-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Ref: {paymentId}
          </p>
        </div>
      )}

      <p className="text-sm text-gray-400 mb-10 max-w-xs mx-auto leading-relaxed">
        Your elite peripherals are being prepped for dispatch. Check your dashboard for real-time tracking.
      </p>

      <div className="flex flex-col gap-3">
        <Button asChild className="w-full bg-black hover:bg-green-600 text-white py-7 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-black/10">
          <Link href="/orders" className="flex items-center justify-center gap-2">
            View My Orders <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        
        <Link 
          href="/" 
          className="text-gray-400 text-xs font-black uppercase tracking-widest hover:text-black transition-colors py-2"
        >
          Back to Collection
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6">
      <Suspense fallback={<div className="animate-pulse text-gray-400 font-black">VALIDATING...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}