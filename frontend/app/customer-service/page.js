"use client";
import Link from 'next/link';

export default function CustomerServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Customer Service</h1>
          <p className="text-xl text-blue-100">We're here to help! Find answers or contact our support team</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Navigation Section - Added Back to Home Button */}
        <div className="mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-100"
          >
            🏠 Back to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-bold mb-2">Contact Us</h3>
            <p className="text-gray-600 mb-4">Reach our support team</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Email:</strong></p>
              <p>support@ordercard.com</p>
              <p className="mt-3"><strong>Phone:</strong></p>
              <p>+1-800-ORDERCARD</p>
              <p className="mt-3 text-orange-600 font-semibold">24/7 Support</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">Shipping & Delivery</h3>
            <p className="text-gray-600 mb-4">Track your orders and shipments</p>
            <ul className="text-sm text-gray-700 space-y-2 font-medium">
              <li>✓ Free shipping over $50</li>
              <li>✓ 3-5 business days standard</li>
              <li>✓ 1-2 days express</li>
              <li>✓ Real-time tracking</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">↩️</div>
            <h3 className="text-xl font-bold mb-2">Returns & Refunds</h3>
            <p className="text-gray-600 mb-4">Easy 30-day returns</p>
            <ul className="text-sm text-gray-700 space-y-2 font-medium">
              <li>✓ 30-day guarantee</li>
              <li>✓ Free return shipping</li>
              <li>✓ Full refund in 7-10 days</li>
              <li>✓ No questions asked</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Security & Privacy</h3>
            <p className="text-gray-600 mb-4">Your data is safe</p>
            <ul className="text-sm text-gray-700 space-y-2 font-medium">
              <li>✓ Secure SSL encryption</li>
              <li>✓ Protected payments</li>
              <li>✓ Privacy guaranteed</li>
              <li>✓ Data protection</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 pb-4 border-b-2 border-orange-500">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">💳 What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, digital wallets, UPI, and Razorpay secure payment options. All transactions are encrypted and secure.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📍 How can I track my order?</h3>
              <p className="text-gray-600">You can track your order in real-time from your Dashboard or Orders page after logging in. Updates are sent via email at each stage.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔒 Is my personal information secure?</h3>
              <p className="text-gray-600">Yes, we use industry-standard SSL encryption, PCI-DSS compliance, and advanced security protocols to protect all your data.</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⏱️ Can I modify or cancel my order?</h3>
              <p className="text-gray-600">Orders can be modified or cancelled within 24 hours before dispatch. Contact our support team for assistance.</p>
            </div>

            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🚚 What's your return policy?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee. If you're not satisfied, return the item for a full refund with free return shipping.</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚡ How long does delivery take?</h3>
              <p className="text-gray-600">Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days. Free shipping on orders over $50.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg mb-6">Our friendly support team is ready to help!</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-orange-600 px-6 py-3 font-bold rounded-lg hover:bg-gray-100 transition-colors">
              💬 Live Chat
            </button>
            <button className="bg-yellow-400 text-gray-900 px-6 py-3 font-bold rounded-lg hover:bg-yellow-300 transition-colors">
              📧 Email Support
            </button>
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 font-bold rounded-lg hover:bg-blue-700 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}