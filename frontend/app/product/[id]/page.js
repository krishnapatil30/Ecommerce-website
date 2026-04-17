"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);

        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.some(p => (p.id || p._id) === (res.data.id || res.data._id)));

        const allProducts = await api.get('/products');
        const data = Array.isArray(allProducts.data) ? allProducts.data : (allProducts.data.data || []);
        
        const related = data.filter(
          p => p.categoryId === res.data.categoryId && (p.id || p._id) !== (res.data.id || res.data._id)
        );
        setRelatedProducts(related.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      router.push('/checkout');
    }
  };

  const handleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const productId = product.id || product._id;
    const exists = wishlist.some(p => (p.id || p._id) === productId);
    
    if (exists) {
      const updated = wishlist.filter(p => (p.id || p._id) !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsWishlisted(false);
    } else {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          {' > '}
          <Link href="/search" className="hover:text-orange-600">Products</Link>
          {' > '}
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <img
              src={product.image || product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-contain max-h-[500px] hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400 text-xl">★★★★★</div>
              <span className="text-gray-500 ml-3 font-medium">(125 reviews)</span>
            </div>

            <div className="mb-8 pb-8 border-b border-gray-100">
              <p className="text-5xl font-black text-orange-600 mb-2">₹{product.price}</p>
              <p className="text-gray-500 font-bold flex items-center gap-2">
                <span className="text-green-500">●</span> Fast shipping • Easy returns
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description || 'Premium quality product with excellent features and durability.'}
              </p>
            </div>

            <div className={`mb-8 p-4 rounded-2xl border ${product.stock > 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <p className="font-bold flex items-center gap-2">
                {product.stock > 0 ? `✓ ${product.stock} items available in stock` : '✕ Currently out of stock'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-10">
              <button
                onClick={() => addToCart(product)}
                className="flex-[2] bg-orange-500 text-white py-5 px-6 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95 text-lg"
              >
                🛒 Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gray-900 text-white py-5 px-6 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95 text-lg"
              >
                ⚡ Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`px-6 py-5 border-2 rounded-2xl font-bold transition-all text-2xl ${isWishlisted ? 'border-red-100 bg-red-50' : 'border-gray-100 hover:border-orange-500'}`}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Product Details Table */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="font-black text-gray-900 text-xl mb-6">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Category</span>
                <span className="text-gray-800 font-black">{product.category?.name || 'Uncategorized'}</span>
                
                <span className="text-gray-400 font-bold uppercase tracking-wider">Availability</span>
                <span className={`font-black ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                
                <span className="text-gray-400 font-bold uppercase tracking-wider">Catalog Date</span>
                <span className="text-gray-800 font-black">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-gray-200 pt-16">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-2 h-10 bg-orange-500 rounded-full"></div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                Related Products
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <Link key={p.id || p._id} href={`/product/${p.id || p._id}`}>
                  <div className="group bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                    <div className="aspect-square bg-gray-50 rounded-2xl mb-5 overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={p.image || p.imageUrl}
                        alt={p.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Displaying the name clearly */}
                    <h3 className="font-black text-gray-800 text-lg mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {p.name}
                    </h3>
                    <div className="mt-auto flex justify-between items-center">
                      <p className="text-orange-600 font-black text-2xl">₹{p.price}</p>
                      <span className="bg-orange-50 text-orange-600 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}