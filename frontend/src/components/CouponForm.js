'use client'

import { useState } from 'react'
import { validateCoupon } from '@/utils/api'

export default function CouponForm({ total, onApply }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discount, setDiscount] = useState(null)

  const handleValidate = async (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setLoading(true)
    setError('')
    setDiscount(null)

    try {
      const res = await validateCoupon(code, total)
      setDiscount(res.data.data)
      onApply(res.data.data)
      setCode('')
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid coupon code')
      setDiscount(null)
      onApply(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-3">🎟️ Apply Coupon</h3>
      <form onSubmit={handleValidate} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={loading || !!discount}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-200"
        />
        <button
          type="submit"
          disabled={loading || !!discount}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-slate-400 font-semibold"
        >
          {loading ? '⏳' : 'Apply'}
        </button>
        {discount && (
          <button
            type="button"
            onClick={() => {
              setDiscount(null)
              onApply(null)
              setCode('')
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
          >
            ✕
          </button>
        )}
      </form

      {error && (
        <p className="text-red-600 text-sm mt-2">❌ {error}</p>
      )}

      {discount && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 font-semibold">✅ Coupon Applied!</p>
          <p className="text-sm text-green-600">{discount.code} - {discount.type === 'percentage' ? `${discount.discount}%` : `$${discount.discount}`} off</p>
          <p className="text-sm font-bold text-green-700 mt-1">Discount: ${discount.discount}</p>
        </div>
      )}
    </div>
  )
}
