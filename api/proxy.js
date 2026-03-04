export const config = {
  runtime: 'edge', // This is the magic word that fixes the stream!
};

export default async function handler(req) {
  // Handle the security check from Janitor AI
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }

  try {
    // Read your message
    const auth = req.headers.get('authorization');
    const bodyText = await req.text();

    // Forward it to NVIDIA
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: bodyText,
    });

    // Create the direct streaming pipe back to Janitor AI
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: headers
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
