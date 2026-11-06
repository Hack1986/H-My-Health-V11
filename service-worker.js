// H My Health V11 — offline-first local storage; no cloud or account services.
const CACHE_NAME = 'h-my-health-v11';
const APP_ROOT = new URL('./', self.registration.scope);
const CORE_PATHS = [
 './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './guide-home.svg','./guide-profile.svg','./guide-entry.svg','./guide-reportView.svg',
 './guide-history.svg','./guide-settings.svg','./guide-appointments.svg',
 './guide-emergency.svg','./guide-medication.svg','./guide-developer.svg'
];
self.addEventListener('install', event => {
 event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);for(const path of CORE_PATHS){const url=new URL(path,APP_ROOT);try{const response=await fetch(url,{cache:'reload'});if(response.ok)await cache.put(url,response.clone());}catch(e){/* first install needs a connection; continue caching available files */}}await self.skipWaiting();})());
});
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith('my-health-record-')||k.startsWith('h-my-health-'))&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());
});
self.addEventListener('fetch', event => {
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==APP_ROOT.origin||!url.pathname.startsWith(APP_ROOT.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);const cached=await cache.match(req,{ignoreSearch:req.mode==='navigate'});if(cached)return cached;try{const response=await fetch(req);if(response&&response.ok)cache.put(req,response.clone());return response;}catch(e){if(req.mode==='navigate'){const fallback=await cache.match(new URL('./index.html',APP_ROOT));if(fallback)return fallback;}return new Response('ออฟไลน์: ไฟล์นี้ยังไม่อยู่ในแคช กรุณาเปิดแอปขณะเชื่อมต่ออินเทอร์เน็ตหนึ่งครั้ง',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
