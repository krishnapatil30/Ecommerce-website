"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      alert("Please login to view your orders");
      router.push("/login");
      return;
    }

    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my-orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        alert("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="animate-spin mb-4">⏳</div>
          <p className="text-slate-600 font-semibold">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📦</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Your Order History
            </h1>
          </div>
          <p className="text-slate-600 mt-2">
            Track and manage all your purchases
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No orders yet
            </h2>
            <p className="text-slate-500 mb-8">
              When you place an order, it will appear here. Start shopping to
              create your first order!
            </p>
            <Link href="/">
              <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                🛒 Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <p className="text-slate-600 text-sm font-medium">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {orders.length}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-slate-600 text-sm font-medium">
                    Total Spent
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    $
                    {orders
                      .reduce((sum, order) => sum + order.total, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-slate-600 text-sm font-medium">Account</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        📅{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-slate-900">
                        ${order.total.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "completed" ||
                                order.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                        }`}>
                        {order.status === "pending" && "⏳ "}
                        {(order.status === "completed" ||
                          order.status === "PAID") &&
                          "✅ "}
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-200 bg-slate-50"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product.id}`}>
                          <h4 className="text-lg font-semibold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer truncate">
                            {item.product.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-slate-500 mt-1">
                          Category:{" "}
                          <span className="font-medium text-slate-700">
                            {item.product.category?.name || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          Unit Price:{" "}
                          <span className="font-semibold text-slate-900">
                            ${item.price.toFixed(2)}
                          </span>
                        </p>
                      </div>

                      {/* Quantity & Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-slate-500">Quantity</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {item.quantity}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Subtotal</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between items-center">
                  <p className="text-slate-600">
                    Payment Status:{" "}
                    <span
                      className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                      {order.paymentStatus === "paid"
                        ? "✅ Paid"
                        : "⏳ " + order.paymentStatus}
                    </span>
                  </p>
                  <Link href={`/product/${order.items[0]?.product.id}`}>
                    <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Continue Shopping Button */}
            <div className="text-center mt-12">
              <Link href="/">
                <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                  🛒 Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
