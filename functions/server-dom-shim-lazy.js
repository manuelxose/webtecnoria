// Lazy-loading DOM shim for SSR - only initializes when actually called
let initialized = false;

module.exports = function initializeDOMShim() {
  if (initialized) {
    return; // Ya está inicializado
  }
  
  initialized = true;
  
  const fs = require('fs');
  const path = require('path');

  // Load Zone.js first - updated path for zone.js 0.15+
  try {
    require('zone.js/node');
  } catch (err) {
    // Fallback to old path for older versions
    require('zone.js/dist/zone-node');
  }

  // Try to use domino for a real DOM
  try {
    const domino = require('domino');
    
    // Try multiple possible template locations
    const possiblePaths = [
      path.join(process.cwd(), 'dist/landrick-angular', 'index.html'),
      path.join(process.cwd(), 'dist/landrick-angular/browser', 'index.html'),
      path.join(__dirname, '../dist/landrick-angular', 'index.html'),
      path.join(__dirname, '../dist/landrick-angular/browser', 'index.html')
    ];
    
    let templatePath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        templatePath = p;
        break;
      }
    }
    
    if (templatePath) {
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
      
      console.log('✓ Domino DOM initialized successfully');
    } else {
      console.warn('⚠ Template not found, using fallback');
      setupFallbackDOM();
    }
  } catch (error) {
    console.warn('⚠ Domino failed, using comprehensive fallback shim:', error.message || 'Template not found, using fallback');
    setupFallbackDOM();
  }

  console.log('✓ DOM shim loaded successfully');
};

function setupFallbackDOM() {
  // Fallback DOM implementation
  class MockNode {
    constructor() {
      this.childNodes = [];
      this.parentNode = null;
      this.nodeName = '';
      this.nodeType = 1;
    }
    appendChild(child) { this.childNodes.push(child); child.parentNode = this; return child; }
    removeChild(child) { 
      const idx = this.childNodes.indexOf(child);
      if (idx > -1) this.childNodes.splice(idx, 1);
      child.parentNode = null;
      return child;
    }
    insertBefore(newNode, refNode) {
      const idx = this.childNodes.indexOf(refNode);
      if (idx > -1) this.childNodes.splice(idx, 0, newNode);
      else this.childNodes.push(newNode);
      newNode.parentNode = this;
      return newNode;
    }
    cloneNode() { return new MockNode(); }
    hasChildNodes() { return this.childNodes.length > 0; }
  }

  class MockElement extends MockNode {
    constructor(tagName = 'div') {
      super();
      this.tagName = tagName.toUpperCase();
      this.nodeName = this.tagName;
      this.attributes = {};
      this.classList = {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => false
      };
      this.style = {};
      this.className = '';
    }
    getAttribute(name) { return this.attributes[name] || null; }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    hasAttribute(name) { return name in this.attributes; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    getElementsByTagName() { return []; }
    getElementsByClassName() { return []; }
    getElementById() { return null; }
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
    getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; }
    scrollIntoView() {}
    focus() {}
    blur() {}
    click() {}
  }

  class MockHTMLElement extends MockElement {
    constructor(tagName = 'div') {
      super(tagName);
      this.innerHTML = '';
      this.textContent = '';
      this.innerText = '';
    }
  }

  class MockDocument extends MockElement {
    constructor() {
      super('document');
      this.documentElement = new MockHTMLElement('html');
      this.head = new MockHTMLElement('head');
      this.body = new MockHTMLElement('body');
      this.documentElement.appendChild(this.head);
      this.documentElement.appendChild(this.body);
    }
    createElement(tagName) { return new MockHTMLElement(tagName); }
    createTextNode(text) { 
      const node = new MockNode();
      node.nodeType = 3;
      node.textContent = text;
      return node;
    }
    createDocumentFragment() { return new MockElement('fragment'); }
    createComment(text) {
      const node = new MockNode();
      node.nodeType = 8;
      node.textContent = text;
      return node;
    }
  }

  class MockWindow {
    constructor() {
      this.document = new MockDocument();
      this.navigator = { userAgent: 'Node.js' };
      this.location = { hostname: 'localhost', href: 'http://localhost', protocol: 'http:', host: 'localhost' };
      this.history = { pushState: () => {}, replaceState: () => {}, back: () => {}, forward: () => {} };
      this.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
      this.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
      this.setTimeout = setTimeout;
      this.setInterval = setInterval;
      this.clearTimeout = clearTimeout;
      this.clearInterval = clearInterval;
      this.requestAnimationFrame = (cb) => setTimeout(cb, 16);
      this.cancelAnimationFrame = clearTimeout;
      this.getComputedStyle = () => ({ getPropertyValue: () => '' });
      this.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
    }
    addEventListener() {}
    removeEventListener() {}
  }

  const mockWindow = new MockWindow();
  
  global.window = mockWindow;
  global.document = mockWindow.document;
  global.navigator = mockWindow.navigator;
  global.Element = MockElement;
  global.HTMLElement = MockHTMLElement;
  global.Node = MockNode;
  global.HTMLDocument = MockDocument;
  global.DocumentFragment = MockElement;
  global.Event = function Event() {};

  // Add prototype methods that client-side scripts might check
  if (!Element.prototype.matches) {
    Element.prototype.matches = function() { return false; };
  }
  if (!Element.prototype.closest) {
    Element.prototype.closest = function() { return null; };
  }
  if (!Element.prototype.remove) {
    Element.prototype.remove = function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }
}
