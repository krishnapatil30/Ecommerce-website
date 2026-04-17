"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWishlist, removeFromWishlist } from "@/utils/api";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editToken, setEditToken] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setEditToken(token);
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await getWishlist(100);
      setWishlist(res.data.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist(wishlist.filter((w) => w.product.id !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
    });
    alert("✅ Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <p className="text-lg text-slate-600">🔄 Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">
          ❤️ My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-slate-600 mb-4">
              Your wishlist is empty
            </p>
            <Link
              href="/search"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 mb-4">
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} in your
              wishlist
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
                  <Link href={`/product/${item.product.id}`}>
                    <div className="relative h-40 bg-slate-200 flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-110 transition"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <Link href={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-slate-900 hover:text-blue-600 line-clamp-2 mb-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 mb-2">
                      {item.product.category?.name}
                    </p>
                    <div className="mb-auto mb-4">
                      <p className="text-lg font-bold text-blue-600">
                        ${item.product.price}
                      </p>
                      {item.product.averageRating && (
                        <p className="text-sm text-yellow-500">
                          ⭐ {item.product.averageRating}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition text-sm">
                        🛒 Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition text-sm">
                        ❌ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
