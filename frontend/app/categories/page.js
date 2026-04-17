"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/products')
        ]);
        
        const categoryData = Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data.data || []);
        const productData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.data || []);
        
        setCategories(categoryData);
        
        const grouped = {};
        categoryData.forEach(cat => {
          grouped[cat.id || cat._id] = productData.filter(p => (p.categoryId === (cat.id || cat._id)));
        });
        setProducts(grouped);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-orange-600 font-bold">
      Loading categories...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-gray-50 text-gray-800 px-4 py-2 font-bold rounded-xl border border-gray-100 hover:bg-gray-100 transition-all shadow-sm"
          >
            🏠 Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Headings */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">All Categories</h1>
          <p className="text-gray-500 font-bold">Browse products by category</p>
        </div>

        {categories.map((category) => {
          const catId = category.id || category._id;
          const categoryProducts = products[catId] || [];
          
          return (
            <div key={catId} className="mb-20">
              <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-800">{category.name}</h2>
                  <p className="text-sm font-bold text-orange-500 mt-1 uppercase tracking-widest">
                    {categoryProducts.length} items available
                  </p>
                </div>
                <Link 
                  href={`/search?category=${catId}`} 
                  className="text-white bg-gray-900 hover:bg-black font-black px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  View All
                </Link>
              </div>
              
              {categoryProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categoryProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product.id || product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">No products currently in this category.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}