"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
// IMPORT: Make sure this path matches your file structure


export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/products/categories").catch(() => ({ data: [] })), 
        ]);

        // Standardizing product data structure
        const prodData = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data.data || [];
        setProducts(prodData);

        // Standardizing category data structure
        const catData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data.data || [];
        setCategories(catData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* NAVIGATION: Rendered here so it shows on top */}
      

      {/* Attractive Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-32 relative z-10">
          <div className="text-center">
            <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold mb-4 backdrop-blur-md">
              🚀 Premium Shopping Experience
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Welcome to{" "}
              <span className="text-yellow-300 underline decoration-white/30">
                OrderCard
              </span>
            </h1>
            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed font-medium px-4">
              Join thousands of happy customers discovering exclusive deals and
              top-tier products every single day.
            </p>
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap px-4">
              <Link
                href="/search"
                className="bg-white text-orange-600 px-6 md:px-10 py-3 md:py-4 rounded-xl hover:bg-gray-100 transition-all font-bold shadow-xl hover:-translate-y-1 text-sm md:text-base">
                🛍️ Start Shopping
              </Link>
              <Link
                href="/login"
                className="bg-orange-800/40 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl hover:bg-orange-800/60 transition-all font-bold border border-white/40 backdrop-blur-sm text-sm md:text-base">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-transparent text-white px-6 md:px-10 py-3 md:py-4 rounded-xl hover:bg-white/10 transition-all font-bold border-2 border-white text-sm md:text-base">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
        
        {/* Curved Divider */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-[40px] md:h-[50px]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none">
            <path
              d="M1200 120L0 120L0 0C161.3 23.5 350.1 35.8 598.3 35.8C846.5 35.8 1035.3 23.5 1200 0L1200 120Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Category Icons Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-8 w-2 bg-orange-500 rounded-full"></div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 uppercase tracking-wider">
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {(categories && categories.length > 0
            ? categories
            : [
                { id: 1, name: "Electronics", icon: "📱" },
                { id: 2, name: "Fashion", icon: "👕" },
                { id: 3, name: "Home & Kitchen", icon: "🍳" },
                { id: 4, name: "Deals", icon: "🏷️" },
                { id: 5, name: "Beauty", icon: "💄" },
                { id: 6, name: "Fitness", icon: "🏋️" },
              ]
          ).map((category) => (
            <Link
              key={category.id || category._id}
              href={`/search?category=${category.name}`}
              className="group bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all text-center">
              <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
                {category.icon || "📦"}
              </div>
              <p className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-0 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Featured Trends
            </h2>
            <p className="text-gray-500 font-medium text-sm md:text-base">
              Handpicked quality products just for you
            </p>
          </div>
          <Link
            href="/search"
            className="bg-orange-100 text-orange-600 px-6 py-2 rounded-full font-bold hover:bg-orange-200 transition text-sm md:text-base">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white p-4 rounded-2xl shadow-sm animate-pulse border border-gray-100">
                <div className="w-full h-56 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-5 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-5 bg-gray-200 rounded-full w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Modern Deals Banner */}
      <section className="bg-gray-900 text-white py-16 md:py-20 mt-12 md:mt-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-orange-600 -skew-x-12 translate-x-20 opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 italic">
                FLASH DEALS ARE LIVE!
              </h2>
              <p className="text-gray-400 font-medium text-sm md:text-base">
                Up to 60% off on premium electronics and apparel.
              </p>
            </div>
            <div className="flex gap-3 md:gap-4 flex-wrap items-center">
              {products.slice(0, 2).map((p) => (
                <div
                  key={p.id || p._id}
                  className="bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 w-40 md:w-48 hidden lg:block">
                  <p className="text-xs font-bold text-orange-400 mb-1">SAVE BIG</p>
                  <p className="text-sm font-bold truncate">{p.name || p.title}</p>
                </div>
              ))}
              <Link
                href="/search"
                className="bg-orange-500 hover:bg-orange-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-black transition shadow-lg text-sm md:text-base">
                GRAB DEALS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 md:py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">OrderCard</h3>
              <p className="text-sm">
                Your ultimate destination for premium shopping and exclusive
                deals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/search" className="hover:text-white transition">Shop All</Link></li>
                <li><Link href="/deals" className="hover:text-white transition">Deals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/support" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 OrderCard Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}