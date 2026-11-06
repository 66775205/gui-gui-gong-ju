// 高德地图 JS API 的服务端代理。只在 Netlify 环境变量中保存 JsCode 和 Web 服务 Key。
const allowedOrigins = new Set([
  'https://66775205.github.io',
  'https://wondrous-boba-6cb62d.netlify.app'
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

export default async function amapService(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  // 浏览器跨站请求必须来自网站；同源请求没有 Origin 标头。
  if (origin && !allowedOrigins.has(origin)) return reply('{"error":"forbidden"}', 403, null);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (request.method !== 'GET') return reply('{"error":"method not allowed"}', 405, origin);

  const jsCode = process.env.AMAP_JS_CODE;
  const webKey = process.env.AMAP_WEB_SERVICE_KEY;
  const path = url.pathname.slice('/_AMapService'.length);
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

export const config = { path: '/_AMapService/*' };
