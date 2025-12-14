(async () => {
  try {
    const loginRes = await fetch('http://localhost:4005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'adminpass' }),
    });
    const loginData = await loginRes.json();
    console.log('login response:', loginData);
    const token = loginData.token;

    const createRes = await fetch('http://localhost:4005/api/sweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Uploaded Sweet',
        description: 'Uploaded via test script',
        category: 'Test',
        price: 5.0,
        quantity: 10,
        imageUrl: '/sweets/test.jpg',
      }),
    });

    console.log('create status:', createRes.status);
    const createText = await createRes.text();
    console.log('create response:', createText);
  } catch (e) {
    console.error('error:', e);
    process.exit(1);
  }
})();
