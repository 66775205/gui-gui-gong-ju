const CACHE='野路指南-v55';const FILES=['./','./index.html','./style.css?v=21','./visual-refresh.css?v=5','./china-cities.js?v=1','./china-districts.js?v=1','./app.js?v=29','./fishing-map.css?v=2','./fishing-map.js?v=7','./fishing-spots.json','./manifest.webmanifest?v=7','./icon.svg?v=7','./favicon-32.png?v=7','./apple-touch-icon.png?v=7','./icon-192.png?v=7','./icon-512.png?v=7','./icon-maskable-192.png?v=7','./icon-maskable-512.png?v=7','./hero-fisher.jpg','./logo-hupao-white.png',...Array.from({length:24},(_,i)=>`./lure-photos-clean/${String(i+1).padStart(2,'0')}.png`)];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const BYPASS=/(tile\.openstreetmap\.org|tile\.opentopomap\.org|autonavi\.com|arcgisonline\.com|open-meteo\.com)/i;
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||BYPASS.test(req.url)||new URL(req.url).pathname.endsWith('.apk'))return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok&&new URL(req.url).origin===self.location.origin){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
