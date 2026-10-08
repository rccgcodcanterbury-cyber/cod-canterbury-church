export function toRequest(event) {
  const url = event.rawUrl || `https://${event.headers.host || 'localhost'}${event.path || '/'}`;
  return new Request(url, {
    method: event.httpMethod,
    headers: event.headers,
    body: event.httpMethod === 'GET' || event.httpMethod === 'HEAD' ? undefined : event.body || ''
  });
}

export async function toResponse(response) {
  const body = await response.arrayBuffer();
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: Buffer.from(body).toString('base64'),
    isBase64Encoded: true
  };
}
