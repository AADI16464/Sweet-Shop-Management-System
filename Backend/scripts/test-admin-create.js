(async () => {
  try {
    const loginRes = await fetch('http://localhost:4005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({   email: 'pratapadityasingh2000@gmail.com',password: 'Babita@12', }),
    });
    const loginData = await loginRes.json();
    console.log('login response:', loginData);
    if (!loginRes.ok) 
    {
      console.error("Login failed:", loginData);
      return;
    }
    if (!loginData.token) 
    {
      console.error("No token returned:", loginData);
      return;
    }
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
