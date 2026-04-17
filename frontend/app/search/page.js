'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/utils/api'
import ProductCard from '@/components/ProductCard'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState('relevance')
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
    setSelectedCategory(searchParams.get('category') || '')
  }, [searchParams])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    setIsLoggedIn(!!token)
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserName(user.name || 'User')
      } catch (e) { setUserName('User') }
    }

    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories') // Updated endpoint to match admin
        if (res.data) {
          setCategories(Array.isArray(res.data) ? res.data : (res.data.data || []))
        }
      } catch (err) { 
        console.warn("Categories fallback triggered.") 
        setCategories([]) 
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await api.get('/products')
        const data = Array.isArray(res.data) ? res.data : (res.data.data || [])
        setProducts(data)
      } catch (err) {
        console.error("Failed to fetch products", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Keyword Match
      const matchesQuery = !query || 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      
      // 2. Category Match (Improved to handle both IDs and Names)
      const matchesCategory = !selectedCategory || 
        product.categoryId == selectedCategory || 
        product.category === selectedCategory ||
        product.category?.name === selectedCategory ||
        product.category?.id == selectedCategory;

      // 3. Price Match
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesQuery && matchesCategory && matchesPrice
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [products, query, sortBy, priceRange, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="bg-white text-orange-600 hover:bg-orange-50 transition-all px-5 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg hover:-translate-x-1"
            >
              🏠 Back to Home
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Search Results</h1>
              <p className="text-orange-100 text-sm font-medium opacity-80">Finding the best deals for you</p>
            </div>
          </div>
          {isLoggedIn && (
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30 font-bold">
              👤 {userName}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-1/4">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
              <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight">Refine Search</h3>
            </div>
            
            <div className="mb-8">
              <label className="block text-xs font-black uppercase tracking-widest mb-3 text-orange-600">Keyword</label>
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl !text-black !bg-white focus:border-orange-500 outline-none transition-all font-bold" 
                placeholder="tshirt, keyboard..."
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black uppercase tracking-widest mb-3 text-orange-600">Max Price: ₹{priceRange[1]}</label>
              <input 
                type="range" min="0" max="100000" step="500"
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black uppercase tracking-widest mb-3 text-orange-600">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl !text-black !bg-white focus:border-orange-500 outline-none cursor-pointer font-bold appearance-none"
              >
                <option value="">All Categories</option>
                {categories.length > 0 ? (
                  categories.map(cat => <option key={cat.id || cat._id} value={cat.id || cat.name}>{cat.name}</option>)
                ) : (
                  <>
                    <option value="Beauty Products">Beauty Products</option>
                    <option value="Clothing for Female">Clothing for Female</option>
                    <option value="Clothing for men">Clothing for men</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Gym tools">Gym tools</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Snackes">Snackes</option>
                  </>
                )}
              </select>
            </div>

            <button 
              onClick={() => { setQuery(''); setSelectedCategory(''); setPriceRange([0, 100000]); router.push('/search') }}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        <main className="lg:w-3/4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black">
                {filteredProducts.length}
              </span>
              <h2 className="text-lg font-bold text-gray-700">Products Found</h2>
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 border-2 border-gray-100 rounded-xl bg-gray-50 !text-black text-sm font-bold outline-none"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => <div key={i} className="h-96 bg-white rounded-3xl animate-pulse border"></div>)}
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] shadow-xl border-2 border-dashed border-gray-200">
              <div className="text-7xl mb-6">🏜️</div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-500">Try changing your keywords or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-orange-600 animate-bounce">LOADING...</div>}>
      <SearchContent />
    </Suspense>
  )
}