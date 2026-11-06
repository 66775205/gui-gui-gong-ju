// 高德地图 JS API 的服务端代理。JsCode 和 Web 服务 Key 仅存于 Cloudflare Worker Secrets。
const allowedOrigins = new Set([
  'https://66775205.github.io'
]);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || 'https://66775205.github.io',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function reply(body, status, origin) {
  return new Response(body, {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

async function amapService(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  let source = origin;
  if (!source && referer) {
    try { source = new URL(referer).origin; } catch (_) { source = null; }
  }
  const path = url.pathname.slice('/_AMapService'.length);
  // 地图脚本可能使用 Referer 而不是 Origin；两者都没有时不开放收费接口。
  if (path !== '/health' && !allowedOrigins.has(source)) return reply('{"error":"forbidden"}', 403, null);
  if (origin && !allowedOrigins.has(origin)) return reply('{"error":"forbidden"}', 403, null);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (request.method !== 'GET') return reply('{"error":"method not allowed"}', 405, origin);

  const jsCode = env.AMAP_JS_CODE;
  const webKey = env.AMAP_WEB_SERVICE_KEY;
  if (path === '/health') {
    return reply(JSON.stringify({ ready: Boolean(jsCode && webKey) }), 200, origin);
  }
  if (!jsCode || !webKey) return reply('{"error":"proxy not configured"}', 503, origin);

  let upstream;
  if (path === '/search/inputtips' || path === '/search/place') {
    upstream = new URL(path === '/search/inputtips'
      ? 'https://restapi.amap.com/v3/assistant/inputtips'
      : 'https://restapi.amap.com/v3/place/text');
    upstream.search = url.search;
    upstream.searchParams.set('key', webKey);
  } else if (path.startsWith('/v4/map/styles')) {
    upstream = new URL('https://webapi.amap.com' + path);
    upstream.search = url.search;
  } else if (/^\/v[34]\/[a-zA-Z0-9/_-]+$/.test(path)) {
    upstream = new URL('https://restapi.amap.com' + path);
    upstream.search = url.search;
  } else {
    return reply('{"error":"unsupported path"}', 404, origin);
  }
  upstream.searchParams.set('jscode', jsCode);
  try {
    const response = await fetch(upstream, { redirect: 'manual', signal: AbortSignal.timeout(10000) });
    if (response.status >= 300 && response.status < 400) return reply('{"error":"upstream redirect"}', 502, origin);
    const headers = new Headers(corsHeaders(origin));
    headers.set('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=120');
    return new Response(response.body, { status: response.status, headers });
  } catch (_) {
    return reply('{"error":"map service unavailable"}', 502, origin);
  }
}

export default { fetch: amapService };
