import http from 'http';

const API_URL = process.env.API_URL || 'http://localhost:3000';

const user = {
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  password: 'password123',
};

async function createUser() {
  const url = new URL('/api/v1/auth/register', API_URL);

  const data = JSON.stringify(user);

  const options = {
    hostname: url.hostname,
    port: url.port || 3000,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const parsed = JSON.parse(body);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject({ statusCode: res.statusCode, data: parsed });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

createUser()
  .then((data) => console.log('User created successfully:', data))
  .catch((error) => {
    console.error('Failed to create user:', error.data || error.message);
    process.exit(1);
  });
