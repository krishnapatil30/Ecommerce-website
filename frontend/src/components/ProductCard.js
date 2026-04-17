// src/components/ProductCard.js
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { addToWishlist, removeFromWishlist, checkWishlist } from "@/utils/api";

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await checkWishlist(product.id);
        setIsWishlisted(res.data.data.inWishlist);
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    addToCart(product);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
        console.log("❌ Removed from wishlist:", product.id);
      } else {
        await addToWishlist(product.id);
        setIsWishlisted(true);
        console.log("❤️ Added to wishlist:", product.id);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 cursor-pointer transition-all"
      onClick={() => router.push(`/product/${product.id}`)}>
      <div className="aspect-square mb-4 relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain"
        />
        <button
          onClick={handleWishlist}
          disabled={loading}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100 text-xl disabled:opacity-50">
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
        {product.name}
      </h3>
      <div className="flex items-center mb-2">
        <span className="text-yellow-400">★★★★★</span>
        <span className="text-xs text-gray-500 ml-1">(123)</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-gray-900">
            ${product.price}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
