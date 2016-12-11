'use strict';
export default class RgContainer extends HTMLElement {
   static get observedAttributes() {
     return []
   }
   /**
    * Calls super
    */
   constructor() {
     super();
     this.root = this.attachShadow({mode: 'open'});
     this.root.innerHTML = `
     <style>
       :host {
         display: block;
       }
     </style>
     `;
   }
   attributeChangedCallback(name, oldVal, newVal) {
     console.log(name, oldVal, newVal);
   }
}
customElements.define('rg-container', RgContainer)
