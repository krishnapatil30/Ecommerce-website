"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getWishlistCount } from "@/utils/api";

export default function Navbar() {
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const updateUserData = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || "User");
          setUserRole(user.role || "user");
        } catch (e) {
          setUserName("");
          setUserRole("user");
        }
      }

      if (token) {
        getWishlistCount()
          .then((res) => setWishlistCount(res.data?.data?.count || 0))
          .catch(() => setWishlistCount(0));
      } else {
        setWishlistCount(0);
      }
    };

    updateUserData();

    // Listens for local updates (like from login/logout)
    window.addEventListener("storage", updateUserData);
    return () => window.removeEventListener("storage", updateUserData);
  }, []);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole("");
    setUserName("");
    setWishlistCount(0);
    router.push("/");
    // Trigger update for other components
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="text-2xl font-black text-orange-600 tracking-tighter">
            OrderCard
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-2.5 border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-gray-50"
              />
              <button type="submit" className="px-6 bg-orange-600 text-white rounded-r-xl hover:bg-orange-700 font-bold transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Right Side Icons & Auth */}
          <div className="flex items-center gap-6">
            
            {/* Dynamic Greeting & User Menu */}
            <div className="relative group">
              <button className="text-sm text-gray-700 hover:text-orange-600 font-bold transition-colors py-2">
                Hello{isLoggedIn ? `, ${userName}` : ""}
              </button>
              
              <div className="absolute right-0 mt-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl hidden group-hover:block z-50 overflow-hidden">
                {isLoggedIn ? (
                  <>
                    <Link href={userRole === "admin" ? "/admin" : "/dashboard"} className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 font-semibold">
                      {userRole === "admin" ? "Admin Panel" : "My Dashboard"}
                    </Link>
                    <Link href="/orders" className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50">Your Orders</Link>
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="p-2">
                    <Link href="/login" className="block text-center bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700">
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Icons visible only when Logged In */}
            {isLoggedIn && (
              <>
                {/* Wishlist Icon */}
                <Link href="/wishlist" className="relative p-2 text-gray-700 hover:bg-orange-50 rounded-full transition-all group">
                  <span className="text-2xl group-hover:scale-110 inline-block transition-transform">🤍</span>
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Basket/Cart Icon */}
                <Link href="/cart" className="relative p-2 text-gray-700 hover:bg-orange-50 rounded-full transition-all group">
                  <span className="text-2xl group-hover:scale-110 inline-block transition-transform">🧺</span>
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-gray-50 border-t border-gray-100 py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto px-8 flex gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <Link href="/search" className="hover:text-orange-600 transition">All Products</Link>
          <Link href="/categories" className="hover:text-orange-600 transition">Categories</Link>
          <Link href="/deals" className="hover:text-orange-600 transition">Deals</Link>
          {isLoggedIn && (
            <Link href="/orders" className="text-orange-600 hover:text-orange-700 transition">
              📦 My Orders
            </Link>
          )}
          <Link href="/customer-service" className="hover:text-orange-600 transition">Support</Link>
        </div>
      </div>
    </nav>
  );
}