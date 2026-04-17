"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add-product");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    const userData = userStr ? JSON.parse(userStr) : null;
    if (userData?.role !== "admin") {
      router.push("/");
      return;
    }
    setIsAuthorized(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/orders/all-orders"),
        api.get("/products/categories"),
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      console.log("📋 Orders Data:", ordersRes.data);
      setCategories(
        Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data.data || [],
      );
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (product) => {
    // Ensure we handle both MongoDB _id and standard id
    const prodId = product.id || product._id;
    setEditingProduct(product);

    // Ensure categoryId is extracted correctly whether it's an object or a string
    const catId =
      typeof product.categoryId === "object"
        ? product.categoryId._id
        : product.categoryId || product.category || "";

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      categoryId: catId,
    });

    setActiveTab("add-product");
    // Smooth scroll to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
    });
    setEditingProduct(null);
    setFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();

    // Append all text fields
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // Only append file if a new one is selected
    if (file) data.append("image", file);

    try {
      const id = editingProduct?.id || editingProduct?._id;
      if (editingProduct) {
        await api.put(`/products/${id}`, data);
        alert("Product updated successfully!");
      } else {
        await api.post("/products/create", data);
        alert("New product created!");
      }
      resetForm();
      setActiveTab("manage-products");
      fetchData();
    } catch (err) {
      alert("Operation failed. Check if all fields are filled correctly.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) return null;

  // Helper for input classes to avoid repetition and ensure visibility
  const inputClasses =
    "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12 px-6 shadow-2xl mb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-blue-200 mt-2">
              Manage store inventory and customer orders
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="bg-white/10 hover:bg-red-500 hover:text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold transition-all">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-10 bg-slate-200/50 p-2 rounded-2xl w-fit backdrop-blur-sm">
          <button
            onClick={() => {
              setActiveTab("add-product");
            }}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "add-product" ? "bg-white text-blue-700 shadow-md" : "text-slate-600 hover:bg-white/50"}`}>
            {editingProduct ? "✏️ Edit Product" : "➕ Add Product"}
          </button>
          <button
            onClick={() => setActiveTab("manage-products")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "manage-products" ? "bg-white text-blue-700 shadow-md" : "text-slate-600 hover:bg-white/50"}`}>
            📋 Inventory
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "orders" ? "bg-white text-blue-700 shadow-md" : "text-slate-600 hover:bg-white/50"}`}>
            📦 Orders
          </button>
        </div>

        {/* ADD / EDIT PRODUCT */}
        {activeTab === "add-product" && (
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingProduct
                  ? `Editing: ${editingProduct.name}`
                  : "Publish New Product"}
              </h2>
              {editingProduct && (
                <button
                  onClick={resetForm}
                  className="text-sm text-red-500 font-bold hover:underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 ml-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    className={inputClasses}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 ml-1">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    className={inputClasses}
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required>
                    <option value="" className="text-slate-900">
                      Select Category
                    </option>
                    {categories.map((cat, idx) => (
                      <option
                        key={cat.id || cat._id || `cat-${idx}`}
                        value={cat.id || cat._id}
                        className="text-slate-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 ml-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    className={inputClasses}
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 ml-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    className={inputClasses}
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className={inputClasses}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell customers about this product..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">
                  Product Image{" "}
                  {editingProduct && "(Leave blank to keep current)"}
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 cursor-pointer text-slate-600"
                  required={!editingProduct}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-slate-400">
                {loading
                  ? "🔄 Processing..."
                  : editingProduct
                    ? "Save Changes"
                    : "Publish to Store"}
              </button>
            </form>
          </div>
        )}

        {/* INVENTORY TABLE */}
        {activeTab === "manage-products" && (
          <div className="bg-white rounded-3xl shadow-xl overflow-x-auto border border-slate-200">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase text-xs font-black tracking-widest">
                  <th className="p-6">Image</th>
                  <th className="p-6">Product Info</th>
                  <th className="p-6 text-center">Price</th>
                  <th className="p-6 text-center">Stock</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product, idx) => (
                  <tr
                    key={product.id || product._id || `prod-${idx}`}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl shadow-sm border bg-white"
                      />
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-800 text-lg">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        ID: {product.id || product._id}
                      </p>
                    </td>
                    <td className="p-6 text-center font-bold text-blue-600">
                      ₹{product.price}
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock < 10 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-all">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id || product._id)}
                        className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-bold transition-all">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS TABLE */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl shadow-xl overflow-x-auto border border-slate-200">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase text-xs font-black tracking-widest">
                  <th className="p-6">Order Details</th>
                  <th className="p-6">Customer</th>
                  <th className="p-6">Shipping Address</th>
                  <th className="p-6 text-center">Amount</th>
                  <th className="p-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length > 0 ? (
                  orders.map((order, idx) => (
                    <tr
                      key={order.id || order._id || `order-${idx}`}
                      className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <p className="font-mono text-xs text-slate-500">
                          {order.id || order._id}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-6">
                        <p className="font-bold text-slate-800">
                          {order.user?.name || "Customer"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {order.user?.email || "N/A"}
                        </p>
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-slate-700 max-w-xs">
                          <p className="font-medium underline mb-1">
                            {order.shippingDetails?.phone ||
                              order.shippingPhone ||
                              "N/A"}
                          </p>
                          <p>
                            {order.shippingDetails?.address ||
                              order.shippingAddress ||
                              "N/A"}
                            ,{" "}
                            {order.shippingDetails?.city ||
                              order.shippingCity ||
                              "N/A"}
                          </p>
                          <p>
                            {order.shippingDetails?.state ||
                              order.shippingState ||
                              "N/A"}{" "}
                            -{" "}
                            {order.shippingDetails?.zipCode ||
                              order.shippingZipCode ||
                              "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="p-6 text-center font-bold text-slate-900">
                        ₹{order.total || order.totalAmount || order.amount || 0}
                      </td>
                      <td className="p-6 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${order.status === "completed" || order.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-20 text-center text-slate-400 font-bold">
                      No orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
