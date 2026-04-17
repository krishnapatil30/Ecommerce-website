"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function DealsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/products');
        // Sort by price descending to show highest priced as "deals"
        setProducts(res.data.sort((a, b) => b.price - a.price));
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-red-600">
      Loading today's deals...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Added Back to Home Button */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-100"
          >
            🏠 Back to Home
          </Link>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-10 rounded-3xl mb-12 shadow-xl">
          <h1 className="text-5xl font-black mb-4 italic">⚡ Today's Top Deals</h1>
          <p className="text-xl font-medium opacity-90">Save up to 50% on selected items. Offer ends tonight!</p>
        </div>

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Limited Time Offers</h2>
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm">
              🔥 {products.length} products currently on sale
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id || product._id} className="relative group">
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black z-20 shadow-lg group-hover:scale-110 transition-transform">
                  SALE
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed">
            <p className="text-gray-400 text-xl font-bold">Check back later for new deals!</p>
          </div>
        )}
      </div>
    </div>
  );
}