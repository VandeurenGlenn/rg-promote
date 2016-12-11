'use strict';
export default class Rgheader extends HTMLElement {
   static get observedAttributes() {
     return ['opened'];
   }
   constructor() {
     super();
     this.root = this.attachShadow({mode: 'open'});
   }
   connectedCallback() {
     this.root.innerHTML = `
     <style>
       :host {
         display: block;
         height: 384px;
         width: 100%;
         background: #333;
         padding: 8px 16px;
         box-sizing: border-box;
         box-shadow: 0 4px 2px -2px #777;
       }
       .container {
         display: flex;
         flex-direction: row;
         align-items: flex-end;
         width: 100%;
         height: 100%;
       }
       .logo {
         display: flex;
         max-width: 140px;
         width: 100%;
         max-height: 60px;
         height: 100%;
         background: url(@logo);
         background-position: center;
         background-size: contain;
         background-repeat: no-repeat;
       }
     </style>
     <span class="container">
        <span class="logo"></span>
     </span>
     `;
   }
   attributeChangedCallback(name, oldVal, newVal) {
     if (oldVal !== newVal) {
       this[name] = newVal;
     }
   }
}
customElements.define('rg-header', Rgheader)
