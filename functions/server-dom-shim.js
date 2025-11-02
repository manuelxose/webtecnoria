// Comprehensive DOM shim for SSR - loads BEFORE any Angular code
const fs = require('fs');
const path = require('path');

// Load Zone.js first
require('zone.js/dist/zone-node');

// Try to use domino for a real DOM
try {
  const domino = require('domino');
  const templatePath = path.join(process.cwd(), 'dist/landrick-angular/browser', 'index.html');
  
  if (fs.existsSync(templatePath)) {
    const template = fs.readFileSync(templatePath, 'utf8');
    const win = domino.createWindow(template);
    
    // Set up complete globals from domino
    global.window = win;
    global.document = win.document;
    global.navigator = win.navigator;
    global.Event = win.Event;
    global.Element = win.Element;
    global.HTMLElement = win.HTMLElement;
    global.Node = win.Node;
    global.HTMLDocument = win.HTMLDocument;
    global.DocumentFragment = win.DocumentFragment;
    
    // Ensure location is properly set
    if (!global.window.location) {
      global.window.location = { hostname: 'localhost', href: 'http://localhost' };
    }
    if (!global.window.location.hostname) {
      global.window.location.hostname = 'localhost';
    }
    
    // Add missing DOM APIs that some libraries expect
    if (!global.document.location) {
      global.document.location = global.window.location;
    }
    
    console.log('✓ Domino DOM initialized successfully');
  } else {
    throw new Error('Template not found, using fallback');
  }
} catch (e) {
  console.log('⚠ Domino failed, using comprehensive fallback shim:', e.message);
  
  // Comprehensive fallback if domino is not available or fails
  
  // Create base Node class
  class Node {
    constructor() {
      this.nodeType = 1;
      this.nodeName = '';
      this.childNodes = [];
      this.parentNode = null;
    }
    appendChild(child) { this.childNodes.push(child); return child; }
    removeChild(child) { 
      const idx = this.childNodes.indexOf(child);
      if (idx > -1) this.childNodes.splice(idx, 1);
      return child;
    }
  }
  
  // Create Element class with all necessary prototypes
  class Element extends Node {
    constructor() {
      super();
      this.style = {};
      this.classList = {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      };
      this.attributes = {};
      this.children = [];
      this.innerHTML = '';
      this.textContent = '';
      this.className = '';
    }
    
    querySelector() { return null; }
    querySelectorAll() { return []; }
    getElementsByClassName() { return []; }
    getElementsByTagName() { return []; }
    getElementById() { return null; }
    addEventListener() {}
    removeEventListener() {}
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name] || null; }
    hasAttribute(name) { return name in this.attributes; }
    removeAttribute(name) { delete this.attributes[name]; }
    closest() { return null; }
    matches() { return false; }
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  }
  
  // HTMLElement extends Element
  class HTMLElement extends Element {
    constructor() {
      super();
    }
  }
  
  // Document class
  class Document extends Node {
    constructor() {
      super();
      this.body = new HTMLElement();
      this.documentElement = new HTMLElement();
      this.head = new HTMLElement();
      this.location = { hostname: 'localhost', href: 'http://localhost' };
    }
    
    createElement() { return new HTMLElement(); }
    createTextNode(text) { 
      const node = new Node();
      node.textContent = text;
      return node;
    }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    getElementsByClassName() { return []; }
    getElementsByTagName() { return []; }
    getElementById() { return null; }
    addEventListener() {}
    removeEventListener() {}
  }
  
  // Set up all globals
  global.Node = Node;
  global.Element = Element;
  global.HTMLElement = HTMLElement;
  global.HTMLDocument = Document;
  global.DocumentFragment = class DocumentFragment extends Node {};
  
  const doc = new Document();
  global.document = doc;
  
  global.window = {
    document: doc,
    location: { hostname: 'localhost', href: 'http://localhost' },
    navigator: { userAgent: 'node.js' },
    addEventListener: () => {},
    removeEventListener: () => {},
    getComputedStyle: () => ({}),
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    Element: Element,
    HTMLElement: HTMLElement,
    Node: Node,
    Event: class Event {}
  };
  
  global.navigator = global.window.navigator;
  global.Event = global.window.Event;
}

// Add CSSStyleDeclaration if missing
if (typeof global.CSSStyleDeclaration === 'undefined') {
  global.CSSStyleDeclaration = class CSSStyleDeclaration {
    constructor() {
      return new Proxy({}, {
        get: () => '',
        set: () => true
      });
    }
  };
}

// Polyfill for Element.prototype methods that libraries might check
if (global.Element && global.Element.prototype) {
  if (!global.Element.prototype.matches) {
    global.Element.prototype.matches = function() { return false; };
  }
  if (!global.Element.prototype.closest) {
    global.Element.prototype.closest = function() { return null; };
  }
  if (!global.Element.prototype.remove) {
    global.Element.prototype.remove = function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }
}

console.log('✓ DOM shim loaded successfully');
