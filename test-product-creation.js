const fs = require('fs');
const FormData = require('form-data');
const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:5000/api';

async function makeRequest(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${path}`);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData ? JSON.parse(responseData) : responseData
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      if (data instanceof FormData) {
        data.pipe(req);
      } else {
        req.write(JSON.stringify(data));
      }
    } else {
      req.end();
    }
  });
}

async function test() {
  try {
    console.log('🔐 Step 1: Logging in...');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'krishnapatil0830@gmail.com',
      password: 'password123'
    }, { 'Content-Type': 'application/json' });

    if (loginRes.status !== 200) {
      console.error('❌ Login failed:', loginRes);
      return;
    }

    const token = loginRes.body.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

    console.log('\n📸 Step 2: Creating test product...');
    const form = new FormData();
    form.append('name', 'Test Product ' + Date.now());
    form.append('description', 'A test product for debugging');
    form.append('price', '99.99');
    form.append('stock', '10');
    form.append('categoryId', '1');
    
    // Create a simple test image file
    const testImagePath = 'c:/tmp/test-image.txt';
    const testImageContent = 'This is a test image file';
    
    // Create /tmp directory if it doesn't exist
    const tmpDir = 'c:/tmp';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    fs.writeFileSync(testImagePath, testImageContent);
    form.append('image', fs.createReadStream(testImagePath), { filename: 'test-image.txt', contentType: 'text/plain' });

    const createRes = await makeRequest('POST', '/products/create', form, {
      ...form.getHeaders(),
      'Authorization': `Bearer ${token}`
    });

    console.log('\n📤 Response Status:', createRes.status);
    console.log('📤 Response Body:', JSON.stringify(createRes.body, null, 2));

    // Clean up
    fs.unlinkSync(testImagePath);

    if (createRes.status === 201 || createRes.status === 200) {
      console.log('\n✅ SUCCESS! Product created successfully');
    } else {
      console.log('\n❌ FAILED! Check the backend logs for details');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

test();
