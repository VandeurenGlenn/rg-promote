'use strict';
import PubSub from './../internals/pub-sub.js';
export default class FireData extends PubSub {
   static get observedAttributes() { return [] }
   constructor() {
     super();
   }
   connectedCallback() {
     this.dataRef = firebase.database().ref();
     console.log();
     this.dataRef.child('promoter').on('value', snapshot => {
       let value = snapshot.val();
       this.promoterData = value;
       this.publish('promoter.change', value);
     });
   }
   set promoterData(value) {
     this._promoterData = value;
   }
   set path(value) {
   }
   get promoterData() {
     return this._promoterData;
   }
   attributeChangedCallback(name, oldVal, newVal) {
     console.log(name, oldVal, newVal);
   }
}
customElements.define('fire-data', FireData);
