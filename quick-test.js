const http = require('http');

function makeRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch(e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  try {
    console.log('Testing product creation endpoint...\n');

    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'krishnapatil0830@gmail.com',
      password: 'password123'
    });
    
    console.log('   Status:', loginRes.status);
    if (loginRes.status !== 200) {
      console.log('   Error:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('   ✅ Got token:', token.substring(0, 20) + '...\n');

    // Step 2: Test POST to /products/create (this will fail without multipart form-data)
    console.log('2️⃣  Testing POST /products/create with JSON...');
    const testRes = await makeRequest('POST', '/api/products/create',
      {
        name: 'Test Product',
        description: 'A test product',
        price: '99.99',
        stock: '10',
        categoryId: '1'
      },
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('   Status:', testRes.status);
    console.log('   Response:', JSON.stringify(testRes.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
