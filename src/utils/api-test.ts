// Utility para testar comunicação com a API
export async function testApiConnection() {
  try {
    const response = await fetch('https://api.spooliq.rodolfodebonis.com.br/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    const data = await response.json()
    console.log('Response data:', data)

    return { success: true, data }
  } catch (error) {
    console.error('API Test Error:', error)
    return { success: false, error }
  }
}