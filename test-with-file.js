const http = require('http');
const fs = require('fs');
const path = require('path');

function makeMultipartRequest(method, path, fields, file, token) {
  return new Promise((resolve, reject) => {
    // Generate a unique boundary
    const boundary = '----BOUNDARY' + Date.now();
    
    // Build multipart body
    let body = '';
    
    // Add form fields
    for (const [key, value] of Object.entries(fields)) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      body += `${value}\r\n`;
    }
    
    // Add file field
    if (file) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="image"; filename="${file.name}"\r\n`;
      body += `Content-Type: ${file.type}\r\n\r\n`;
      body += file.content;
      body += `\r\n`;
    }
    
    // End boundary
    body += `--${boundary}--\r\n`;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${token}`
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
    req.write(body);
    req.end();
  });
}

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
    // Login
    console.log('🔐 Logging in...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'testuser@example.com',
      password: 'test123456'
    });
    
    if (loginRes.status !== 200) {
      console.log('❌ Login failed:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('✅ Got token\n');

    // Create product with file
    console.log('📸 Creating product with image file...');
  const createRes = await makeMultipartRequest(
      'POST', 
      '/api/products/create',
      {
        name: 'Test Product ' + Date.now(),
        description: 'Testing product creation with file',
        price: '99.99',
        stock: '10',
        categoryId: '1'
      },
      {
        name: 'test-image.txt',
        type: 'text/plain',
        content: 'This is a test image file'
      },
      token
    );
    
    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createRes.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
