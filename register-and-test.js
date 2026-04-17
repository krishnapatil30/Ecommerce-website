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
    // Step 1: Register
    console.log('1️⃣  Registering test user...');
    const registerRes = await makeRequest('POST', '/api/auth/register', {
      email: 'testuser@example.com',
      password: 'test123456',
      name: 'Test User'
    });
    
    console.log('   Status:', registerRes.status);
    if (registerRes.status !== 201 && registerRes.status !== 200) {
      console.log('   Response:', registerRes.data);
      if (registerRes.status === 400 && registerRes.data.message?.includes('already')) {
        console.log('   (User probably already exists, proceeding with login)\n');
      } else {
        return;
      }
    } else {
      console.log('   ✅ User registered\n');
    }

    // Step 2: Login
    console.log('2️⃣  Logging in...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'testuser@example.com',
      password: 'test123456'
    });
    
    console.log('   Status:', loginRes.status);
    if (loginRes.status !== 200) {
      console.log('   Response:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('   ✅ Got token:', token.substring(0, 20) + '...\n');

    // Step 3: Try to create product (without file, just to see error)
    console.log('3️⃣  Testing product creation...');
    const createRes = await makeRequest('POST', '/api/products/create',
      {
        name: 'Test Product',
        description: 'Testing product creation',
        price: '99.99',
        stock: '10',
        categoryId: '1'
      },
      { 'Authorization': `Bearer ${token}` }
    );
    
    console.log('   Status:', createRes.status);
    console.log('   Response:', JSON.stringify(createRes.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
