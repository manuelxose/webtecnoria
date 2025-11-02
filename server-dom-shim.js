// Carga DOM y Zone para SSR ANTES de cargar el bundle del servidor
const fs = require('fs');
const path = require('path');

// 1) Zone.js
try { require('zone.js/node'); } catch { try { require('zone.js/dist/zone-node'); } catch {} }

// 2) Index.html (prioridad: env → angular-ssr → dist/browser)
const htmlCandidates = [
  process.env.SSR_INDEX_HTML,
  path.join(process.cwd(), 'angular-ssr', 'index.html'),
  path.join(process.cwd(), 'dist', 'browser', 'index.html'),
].filter(Boolean);

// 3) Domino si está disponible
let initialized = false;
function applyDomino(htmlPath) {
  if (!htmlPath || initialized) return;
  if (!fs.existsSync(htmlPath)) return;
  const domino = (() => { try { return require('domino'); } catch { return null; } })();
  if (!domino) return;
  const tpl = fs.readFileSync(htmlPath, 'utf8');
  const win = domino.createWindow(tpl);

  global.window = win;
  global.document = win.document;
  global.navigator = win.navigator;
  global.Event = win.Event;
  global.Element = win.Element;
  global.HTMLElement = win.HTMLElement;
  global.Node = win.Node;
  global.HTMLDocument = win.HTMLDocument;
  global.DocumentFragment = win.DocumentFragment;

  global.window.location ||= { hostname: 'localhost', href: 'http://localhost' };
  global.document.location ||= global.window.location;

  initialized = true;
  console.log('✓ Domino DOM initialized:', htmlPath);
}

// Intenta con la primera ruta válida
for (const p of htmlCandidates) {
  try { applyDomino(p); if (initialized) break; } catch {}
}

// 4) Fallback minimal si Domino no está
if (!initialized) {
  class Node { constructor(){ this.nodeType=1; this.nodeName=''; this.childNodes=[]; this.parentNode=null; } appendChild(c){this.childNodes.push(c);return c;} removeChild(c){const i=this.childNodes.indexOf(c); if(i>-1)this.childNodes.splice(i,1); return c;}}
  class Element extends Node { constructor(){ super(); this.style={}; this.classList={add(){},remove(){},toggle(){},contains(){return false}}; this.attributes={}; this.children=[]; this.innerHTML=''; this.textContent=''; this.className=''; }
    querySelector(){return null} querySelectorAll(){return []} getElementsByClassName(){return []} getElementsByTagName(){return []}
    getElementById(){return null} addEventListener(){} removeEventListener(){} setAttribute(n,v){this.attributes[n]=v} getAttribute(n){return this.attributes[n]||null}
    hasAttribute(n){return n in this.attributes} removeAttribute(n){delete this.attributes[n]} closest(){return null} matches(){return false}
    getBoundingClientRect(){return {top:0,left:0,width:0,height:0}}
  }
  class HTMLElement extends Element {}
  class Document extends Node { constructor(){ super(); this.body=new HTMLElement(); this.documentElement=new HTMLElement(); this.head=new HTMLElement(); this.location={hostname:'localhost',href:'http://localhost'}; }
    createElement(){return new HTMLElement()} createTextNode(text){const n=new Node(); n.textContent=text; return n;}
    querySelector(){return null} querySelectorAll(){return []} getElementsByClassName(){return []} getElementsByTagName(){return []} getElementById(){return null}
    addEventListener(){} removeEventListener(){}
  }
  global.Node=Node; global.Element=Element; global.HTMLElement=HTMLElement; global.HTMLDocument=Document; global.DocumentFragment=class extends Node {};
  const doc=new Document(); global.document=doc;
  global.window={ document:doc, location:{hostname:'localhost',href:'http://localhost'}, navigator:{userAgent:'node.js'},
    addEventListener(){}, removeEventListener(){}, getComputedStyle(){return {}}, requestAnimationFrame:(cb)=>setTimeout(cb,16), cancelAnimationFrame:(id)=>clearTimeout(id),
    Element, HTMLElement, Node, Event: class Event {} };
  global.navigator=global.window.navigator; global.Event=global.window.Event;

  if (typeof global.CSSStyleDeclaration === 'undefined') {
    global.CSSStyleDeclaration = class { constructor(){ return new Proxy({},{get:()=>'', set:()=>true}); } };
  }
  if (global.Element && global.Element.prototype) {
    global.Element.prototype.matches ||= function(){return false};
    global.Element.prototype.closest ||= function(){return null};
    global.Element.prototype.remove ||= function(){ this.parentNode && this.parentNode.removeChild(this); };
  }
  console.log('✓ Minimal DOM shim initialized (fallback)');
}
