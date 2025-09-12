/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react/no-deprecated */

// React 19 polyfill for React Quill compatibility
// This file provides a polyfill for the deprecated findDOMNode method

// Apply polyfill immediately when this module loads
const applyPolyfill = () => {
  try {
    const polyfill = (node: any): Element | null => {
      if (node && node.nodeType === 1) {
        return node;
      }
      if (node && node._reactInternalFiber) {
        return node._reactInternalFiber?.stateNode || null;
      }
      if (node && node._reactInternalInstance) {
        return node._reactInternalInstance?.stateNode || null;
      }
      return null;
    };
    
    // Try to get React and ReactDOM from various sources
    let React, ReactDOM;
    
    try {
      React = require('react');
      ReactDOM = require('react-dom');
    } catch {
      // If require fails, try global scope
      React = (globalThis as any).React;
      ReactDOM = (globalThis as any).ReactDOM;
    }
    
    // Add to React
    if (React && !React.findDOMNode) {
      React.findDOMNode = polyfill;
    }
    
    // Add to ReactDOM
    if (ReactDOM && !ReactDOM.findDOMNode) {
      ReactDOM.findDOMNode = polyfill;
    }
    
    // Handle the specific case where React Quill might be looking for react_dom_1.default.findDOMNode
    // This is a common pattern in bundled code
    if (typeof globalThis !== 'undefined') {
      // Create a mock react-dom module structure
      const mockReactDOM = {
        default: {
          findDOMNode: polyfill,
          ...ReactDOM
        },
        findDOMNode: polyfill,
        ...ReactDOM
      };
      
      // Store in global scope with common module names
      (globalThis as any).React = React;
      (globalThis as any).ReactDOM = ReactDOM;
      (globalThis as any)['react-dom'] = mockReactDOM;
      (globalThis as any)['react_dom_1'] = mockReactDOM;
      
      // Also try to patch any existing react-dom references
      if (typeof window !== 'undefined') {
        (window as any).React = React;
        (window as any).ReactDOM = ReactDOM;
        (window as any)['react-dom'] = mockReactDOM;
        (window as any)['react_dom_1'] = mockReactDOM;
      }
    }
    
    console.log('React 19 polyfill applied successfully');
  } catch (error) {
    console.warn('Failed to apply React 19 polyfill:', error);
  }
};

// Apply polyfill immediately
applyPolyfill();

// Also apply when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPolyfill);
  } else {
    applyPolyfill();
  }
}
