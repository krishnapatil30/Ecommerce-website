const http = require('http');

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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
    console.log('🧪 Testing User Role Assignment\n');

    // Test 1: Register as regular user
    console.log('1️⃣  Registering new regular user...');
    const newEmail = `user${Date.now()}@test.com`;
    const registerRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: newEmail,
      password: 'test123456'
    });
    
    console.log(`   Status: ${registerRes.status}`);
    console.log(`   Response:`, registerRes.data);
    if (registerRes.status === 201) {
      console.log('   ✅ User registered\n');
    }

    // Test 2: Login as the new user
    console.log('2️⃣  Logging in as new user...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: newEmail,
      password: 'test123456'
    });
    
    console.log(`   Status: ${loginRes.status}`);
    if (loginRes.status === 200) {
      const user = loginRes.data.user;
      console.log(`   ✅ Login successful`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      
      if (user.role === 'user') {
        console.log('   ✨ CORRECT: New user has "user" role\n');
      } else {
        console.log('   ❌ ERROR: New user should have "user" role, got:', user.role, '\n');
      }
    }

    // Test 3: Login as admin
    console.log('3️⃣  Logging in as admin...');
    const adminRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@ordercard.com',
      password: 'admin@123456'
    });
    
    console.log(`   Status: ${adminRes.status}`);
    if (adminRes.status === 200) {
      const user = adminRes.data.user;
      console.log(`   ✅ Admin login successful`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      
      if (user.role === 'admin') {
        console.log('   ✨ CORRECT: Admin user has "admin" role\n');
      } else {
        console.log('   ❌ ERROR: Admin should have "admin" role, got:', user.role, '\n');
      }
    } else {
      console.log(`   ❌ Admin login failed: ${adminRes.data.message}\n`);
    }

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
