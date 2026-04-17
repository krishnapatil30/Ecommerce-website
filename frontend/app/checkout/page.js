"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("review"); // review, shipping, payment, confirm
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'upi'
  const [accountNumber, setAccountNumber] = useState("");
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  // Handle UPI Payment Success (for "success @razorpay" trigger)
  const handleUPIPaymentSuccessLogic = async () => {
    if (!user) return;

    if (
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.zipCode ||
      !shippingInfo.phone
    ) {
      alert("Please fill in all shipping details");
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // Generate a unique payment ID for UPI success
      const upiPaymentId = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const subtotal = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      const tax = subtotal * 0.1;
      const shipping = subtotal > 100 ? 0 : 9.99;
      const currentTotal = subtotal + tax + shipping;

      const orderPayload = {
        items: orderItems,
        paymentId: upiPaymentId,
        totalAmount: currentTotal,
        shippingDetails: { ...shippingInfo },
        status: "PAID",
        paymentMethod: "UPI",
      };

      const res = await api.post("/orders/create", orderPayload);

      if (res.status === 200 || res.status === 201) {
        clearCart();
        alert("✅ UPI Payment Successful!");
        router.push(`/order-success?id=${upiPaymentId}`);
      }
    } catch (orderError) {
      console.error("UPI Payment error:", orderError);
      alert("Payment succeeded, but order creation failed.");
    } finally {
      setLoading(false);
      setAccountNumber(""); // Clear the field after success
    }
  };

  // Check for UPI success trigger
  useEffect(() => {
    if (
      paymentMethod === "upi" &&
      accountNumber === "success @razorpay" &&
      user
    ) {
      handleUPIPaymentSuccessLogic();
    }
  }, [accountNumber, paymentMethod, user]);
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-slate-500 mb-8">
            Add items to your cart before checking out
          </p>
          <Link href="/">
            <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
              🛍️ Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const handlePayment = async () => {
    if (!user) return;

    if (
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.zipCode ||
      !shippingInfo.phone
    ) {
      alert("Please fill in all shipping details");
      return;
    }

    // Validation for UPI payment
    if (paymentMethod === "upi" && !accountNumber) {
      alert("Please enter your UPI account number");
      return;
    }

    // For UPI payment method
    if (paymentMethod === "upi") {
      setLoading(true);
      try {
        const orderItems = cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }));

        const upiPaymentId = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const orderPayload = {
          items: orderItems,
          paymentId: upiPaymentId,
          totalAmount: total,
          shippingDetails: { ...shippingInfo },
          status: "PAID",
          paymentMethod: "UPI",
          upiAccount: accountNumber,
        };

        const res = await api.post("/orders/create", orderPayload);

        if (res.status === 200 || res.status === 201) {
          clearCart();
          alert(
            "✅ UPI Payment Initiated! Please complete the payment on your phone.",
          );
          router.push(`/order-success?id=${upiPaymentId}`);
        }
      } catch (orderError) {
        console.error("UPI order error:", orderError);
        alert("Order creation failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // For card payment (original logic)
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK.");
        setLoading(false);
        return;
      }

      // 1. Create order
      // Ensure the backend receives the amount in Paise (Total * 100)
      const paymentRes = await api.post("/payment/create-order", {
        amount: Math.round(total * 100),
      });

      const { order, key } = paymentRes.data;

      const orderItems = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const options = {
        key,
        amount: order.amount,
        currency: "INR", // MUST be INR for UPI to show up
        name: "OrderCard Store",
        description: "Test Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const orderPayload = {
              items: orderItems,
              paymentId: response.razorpay_payment_id,
              totalAmount: total,
              shippingDetails: { ...shippingInfo },
              status: "PAID",
            };

            const res = await api.post("/orders/create", orderPayload);

            if (res.status === 200 || res.status === 201) {
              clearCart();
              router.push(`/order-success?id=${response.razorpay_payment_id}`);
            }
          } catch (orderError) {
            alert("Payment succeeded, but order creation failed.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: shippingInfo.phone || "",
        },
        // Forces UPI and Cards to show up prominently
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.upi", "block.card"],
          },
        },
        theme: { color: "#F97316" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment initialization failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 text-4xl">⏳</div>
          <p className="text-slate-600 font-semibold">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">💳</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
          </div>
          <p className="text-slate-600 mt-2">
            Complete your order in a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 flex items-center justify-between max-w-2xl mx-auto">
          {[
            { step: "review", label: "Review", icon: "📦" },
            { step: "shipping", label: "Shipping", icon: "📍" },
            { step: "payment", label: "Payment", icon: "💰" },
            { step: "confirm", label: "Confirm", icon: "✅" },
          ].map((item, idx, arr) => (
            <div key={item.step} className="flex items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                  step === item.step
                    ? "bg-orange-500 text-white scale-110"
                    : "bg-slate-200 text-slate-600"
                }`}>
                {item.icon}
              </div>
              <p
                className={`ml-2 text-sm font-semibold ${step === item.step ? "text-orange-600" : "text-slate-600"}`}>
                {item.label}
              </p>
              {idx < arr.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded-full ${step === item.step || step === arr[idx + 1].step ? "bg-orange-300" : "bg-slate-200"}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Review Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📦</span>
                <h2 className="text-2xl font-bold text-slate-900">
                  Order Review
                </h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-orange-200 transition-all">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-white border border-slate-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Qty:{" "}
                        <span className="font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Unit</p>
                      <p className="font-semibold text-slate-900">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="text-lg font-bold text-orange-600 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address Section */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">📍</span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Shipping Address
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street address"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        value={shippingInfo.state}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            state: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        placeholder="ZIP code"
                        value={shippingInfo.zipCode}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            zipCode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div>
            <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tax (10%)</span>
                  <span className="font-semibold text-slate-900">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">
                    Shipping{" "}
                    {subtotal > 100 && (
                      <span className="text-green-600 text-xs ml-1">FREE</span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${shipping.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items Count */}
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-8">
                <p className="text-sm text-orange-700">
                  📦{" "}
                  <span className="font-semibold">
                    {cart.length} item{cart.length !== 1 ? "s" : ""}
                  </span>{" "}
                  in order
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8 border-t border-slate-200 pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">💳</span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Payment Method
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Card Payment Option */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-semibold text-slate-900">
                      💳 Debit/Credit Card
                    </span>
                    <span className="ml-auto text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                      Razorpay
                    </span>
                  </label>

                  {/* UPI Payment Option */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "upi"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-semibold text-slate-900">
                      📱 UPI Payment
                    </span>
                    <span className="ml-auto text-xs bg-green-100 px-3 py-1 rounded-full text-green-700 font-semibold">
                      NEW
                    </span>
                  </label>
                </div>

                {/* UPI Account Input */}
                {paymentMethod === "upi" && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      UPI Account / Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., yourname@upi or phone number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-blue-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <p className="mt-2 text-xs text-slate-600">
                      💡 Tip: Type "success @razorpay" to test successful UPI
                      payment
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                {loading ? (
                  <span>⏳ Processing...</span>
                ) : (
                  <span>💳 Pay Now ${total.toFixed(2)}</span>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-6 text-center text-xs text-slate-500">
                <p>🔒 Secure checkout powered by Razorpay & UPI</p>
              </div>
            </div>

            {/* Continue Shopping Link */}
            <Link href="/">
              <button className="w-full mt-4 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all">
                ← Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
