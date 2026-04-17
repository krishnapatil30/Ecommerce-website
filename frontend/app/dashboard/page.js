"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function DashboardPage() {
  const router = useRouter();
  const { cart, removeFromCart } = useCart();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cart');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    setUser(userStr ? JSON.parse(userStr) : null);

    const fetchData = async () => {
      try {
        const [ordersRes] = await Promise.all([
          api.get('/orders/my-orders')
        ]);
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Load wishlist from localStorage
    const saved = localStorage.getItem('wishlist');
    setWishlist(saved ? JSON.parse(saved) : []);
    
    fetchData();
  }, [router]);

  const handleAddToWishlist = (product) => {
    const updated = wishlist.some(p => p.id === product.id)
      ? wishlist.filter(p => p.id !== product.id)
      : [...wishlist, product];
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div>Redirecting...</div>;

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">👋 Welcome, {user.name}!</h1>
          <p className="text-orange-100 flex items-center gap-2">📧 {user.email}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-200 flex-wrap">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-6 py-4 font-bold text-lg border-b-4 transition-all ${
              activeTab === 'cart'
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            🛒 Cart <span className="ml-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">{cart.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-bold text-lg border-b-4 transition-all ${
              activeTab === 'orders'
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📦 Orders <span className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">{orders.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-6 py-4 font-bold text-lg border-b-4 transition-all ${
              activeTab === 'wishlist'
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            ❤️ Wishlist <span className="ml-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">{wishlist.length}</span>
          </button>
        </div>

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-orange-500 p-8">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">🛒</p>
                <p className="text-gray-500 mb-4 text-lg font-semibold">Your cart is empty</p>
                <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold text-lg">
                  Continue Shopping →
                </Link>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4 hover:bg-orange-50 p-4 rounded transition">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Subtotal:</span>
                  <span className="text-3xl font-bold text-orange-600">${cartTotal.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="w-full block text-center bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-bold hover:from-orange-700 hover:to-orange-800 transition"
                >
                  Proceed to Checkout →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-blue-500 p-8">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">📦</p>
                <p className="text-gray-500 mb-4 text-lg font-semibold">No orders yet</p>
                <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold text-lg">
                  Start Shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl">Order #{order.id}</h3>
                        <p className="text-gray-600 text-sm">
                          📅 {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-blue-600">${order.total.toFixed(2)}</p>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full mt-2 inline-block ${
                          order.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus === 'completed' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-700 mb-2">📦 Items:</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-gray-600 text-sm flex justify-between">
                            <span>{item.product.name} × {item.quantity}</span>
                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-red-500 p-8">
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-4">❤️</p>
                <p className="text-gray-500 mb-4 text-lg font-semibold">Your wishlist is empty</p>
                <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold text-lg">
                  Browse Products →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                  <div key={product.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-400 hover:shadow-lg transition">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-40 object-contain mb-4 rounded"
                    />
                    <h3 className="font-semibold mb-2 text-lg">{product.name}</h3>
                    <p className="text-orange-600 font-bold text-xl mb-4">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleAddToWishlist(product)}
                      className="w-full bg-red-100 text-red-600 py-2 rounded font-semibold hover:bg-red-200 transition"
                    >
                      💔 Remove from Wishlist
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
