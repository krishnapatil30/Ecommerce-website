const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

async function testAllFeatures() {
  try {
    console.log('===== TESTING ALL NEW FEATURES =====\n');

    // 1. Login as admin
    console.log('[1] Logging in as admin...');
    const loginRes = await api.post('/auth/login', {
      email: 'admin@ordercard.com',
      password: 'admin@123456'
    });
    const adminToken = loginRes.data.token;
    console.log('✅ Admin login successful\n');

    // 2. Create test coupons
    console.log('[2] Creating test coupons...');
    const coupons = [
      { code: 'SAVE10', discount: 10, type: 'percentage', maxUses: 100 },
      { code: 'SAVE20', discount: 20, type: 'percentage', maxUses: 50 },
      { code: 'FLAT5', discount: 5, type: 'fixed', maxUses: 200 }
    ];

    for (const coupon of coupons) {
      try {
        const res = await api.post('/coupons', coupon, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`  ✅ Created coupon: ${coupon.code}`);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes('Unique constraint failed')) {
          console.log(`  ⚠️  ${coupon.code} already exists`);
        } else {
          console.log(`  ❌ Error creating ${coupon.code}: ${err.response?.data?.message || err.message}`);
        }
      }
    }
    console.log('');

    // 3. Test coupon validation
    console.log('[3] Testing coupon validation...');
    const validateRes = await api.post('/coupons/validate', {
      code: 'SAVE10',
      total: 100
    });
    console.log(`  ✅ Coupon SAVE10 valid - Discount: $${validateRes.data.data.discount}, Final Total: $${validateRes.data.data.finalTotal}\n`);

    // 4. Test categories
    console.log('[4] Testing search - Getting categories...');
    const categoriesRes = await api.get('/search/categories');
    console.log(`  ✅ Found ${categoriesRes.data.data.length} categories\n`);

    // 5. Test search
    console.log('[5] Testing search functionality...');
    const searchRes = await api.get('/search/search', {
      params: { q: 'phone', limit: 5 }
    });
    console.log(`  ✅ Search returned ${searchRes.data.data.length} results`);
    console.log(`  Total available: ${searchRes.data.pagination.total}\n`);

    // 6. Login as regular user for wishlist and reviews
    console.log('[6] Logging in as regular user...');
    const userLoginRes = await api.post('/auth/login', {
      email: 'testuser@example.com',
      password: 'test123456'
    });
    const userToken = userLoginRes.data.token;
    console.log('✅ User login successful\n');

    // 7. Test wishlist
    if (searchRes.data.data.length > 0) {
      console.log('[7] Testing wishlist feature...');
      const productId = searchRes.data.data[0].id;
      
      const addWishRes = await api.post(
        '/wishlist',
        { productId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log(`  ✅ Added product to wishlist\n`);

      // Check wishlist count
      const countRes = await api.get('/wishlist/count/total', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log(`[8] Wishlist count: ${countRes.data.data.count}\n`);
    }

    // 8. Test reviews
    if (searchRes.data.data.length > 0) {
      console.log('[9] Testing reviews feature...');
      const productId = searchRes.data.data[0].id;
      
      const addReviewRes = await api.post(
        '/reviews',
        { productId, rating: 5, text: 'Great product! Works perfectly.' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log(`  ✅ Review posted\n`);

      // Get reviews
      const reviewsRes = await api.get(`/reviews/${productId}`);
      console.log(`[10] Product reviews: ${reviewsRes.data.data.reviews.length}`);
      console.log(`  Average rating: ${reviewsRes.data.data.average} stars\n`);
    }

    console.log('===== ALL TESTS COMPLETED SUCCESSFULLY ✅ =====');

  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAllFeatures();
