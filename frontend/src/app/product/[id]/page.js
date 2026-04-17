'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  getProductReviews,
  addReview,
  deleteReview,
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
  getProductImages
} from '@/utils/api'
import api from '@/utils/api'
import { useCart } from '@/context/CartContext'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.id)
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Review form state
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitLoadingReview, setSubmitLoadingReview] = useState(false)
  const [mainImage, setMainImage] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    const fetchData = async () => {
      try {
        // Fetch product
        const productRes = await api.get(`/products/${productId}`)
        setProduct(productRes.data.data)
        setMainImage(productRes.data.data.imageUrl)

        // Fetch reviews
        const reviewsRes = await getProductReviews(productId, 100)
        setReviews(reviewsRes.data.data.reviews)

        // Fetch images
        try {
          const imagesRes = await getProductImages(productId)
          setImages(imagesRes.data.data)
        } catch (e) {
          console.log('No images endpoint')
        }

        // Check wishlist
        if (token) {
          try {
            const wishRes = await checkWishlist(productId)
            setInWishlist(wishRes.data.data.inWishlist)
          } catch (e) {
            console.log('Wishlist check failed')
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity
    })
    alert('✅ Added to cart!')
  }

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(productId)
        setInWishlist(false)
      } else {
        await addToWishlist(productId)
        setInWishlist(true)
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setSubmitLoadingReview(true)
    try {
      await addReview(productId, rating, reviewText)
      setReviewText('')
      setRating(5)
      
      // Refresh reviews
      const res = await getProductReviews(productId, 100)
      setReviews(res.data.data.reviews)
      alert('✅ Review posted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('❌ Error posting review')
    } finally {
      setSubmitLoadingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      await deleteReview(reviewId)
      const res = await getProductReviews(productId, 100)
      setReviews(res.data.data.reviews)
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('❌ Error deleting review')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <p className="text-lg text-slate-600">🔄 Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-lg text-slate-600">❌ Product not found</p>
          <Link href="/search" className="text-blue-600 hover:underline">← Back to search</Link>
        </div>
      </div>
    )
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-white rounded-lg shadow-lg p-8">
          {/* Image */}
          <div>
            <div className="bg-slate-200 rounded-lg h-96 flex items-center justify-center mb-4 overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">📦</span>
              )}
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setMainImage(img.imageUrl)}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-300"
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
            <p className="text-slate-600 mb-4">{product.category?.name}</p>

            {/* Rating */}
            <div className="mb-4">
              <p className="text-2xl font-bold text-blue-600">${product.price}</p>
              {avgRating > 0 && (
                <p className="text-lg text-yellow-500 font-semibold">
                  ⭐ {avgRating} ({reviews.length} reviews)
                </p>
              )}
            </div>

            <p className="text-slate-700 mb-6">{product.description}</p>

            {/* Stock */}
            <p className={product.stock > 0 ? 'text-green-600 font-semibold mb-4' : 'text-red-600 font-semibold mb-4'}>
              {product.stock > 0 ? `✅ In stock (${product.stock} available)` : '❌ Out of stock'}
            </p>

            {/* Quantity & Actions */}
            {product.stock > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-slate-900">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      inWishlist
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                    }`}
                  >
                    {inWishlist ? '❤️ Remove' : '🤍 Wishlist'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">⭐ Reviews ({reviews.length})</h2>

          {/* Add Review Form */}
          {isLoggedIn && (
            <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Share your review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="1">⭐ 1 Star</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Comment (optional)</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    rows="4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitLoadingReview}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-slate-400"
                >
                  {submitLoadingReview ? '⏳ Posting...' : '✅ Post Review'}
                </button>
              </form>
            </div>
          )}

          {!isLoggedIn && (
            <div className="mb-8 p-4 bg-slate-100 rounded-lg">
              <p className="text-slate-700">
                <Link href="/login" className="text-blue-600 hover:underline font-semibold">Login</Link> to post a review
              </p>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-slate-600">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-l-4 border-blue-600 pl-4 py-4 bg-slate-50 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{review.user?.name}</p>
                      <p className="text-sm text-yellow-500">{'⭐'.repeat(review.rating)}</p>
                    </div>
                    {isLoggedIn && JSON.parse(localStorage.getItem('user') || '{}').id === review.userId && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {review.text && <p className="text-slate-700">{review.text}</p>}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
