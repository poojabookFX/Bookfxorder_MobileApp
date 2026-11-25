// Web only: bookfxorder.com sends no CORS headers, so the browser can't call it from
// localhost. The web app calls this same-origin route instead, and the dev server forwards
// the request to the website. Native apps don't enforce CORS and call the website directly.

const WEBSITE = 'https://bookfxorder.com';

// Headers that describe this hop, or that the website would reject from another origin.
const DROP_REQUEST_HEADERS = ['host', 'origin', 'referer', 'connection', 'content-length', 'accept-encoding'];
// fetch already decompressed the body, so these no longer describe it.
const DROP_RESPONSE_HEADERS = ['content-encoding', 'content-length', 'transfer-encoding', 'set-cookie', 'connection'];

async function proxy(request: Request) {
  const url = new URL(request.url);
  const target = `${WEBSITE}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  DROP_REQUEST_HEADERS.forEach((h) => headers.delete(h));
  // better-auth checks Origin on POSTs against its trusted origins.
  headers.set('origin', WEBSITE);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(upstream.headers);
  DROP_RESPONSE_HEADERS.forEach((h) => responseHeaders.delete(h));
  // Drop the Domain attribute so the browser stores the session cookie for localhost.
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append('set-cookie', cookie.replace(/;\s*domain=[^;]*/i, ''));
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
