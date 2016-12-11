'use strict';
import PubSub from './../internals/pub-sub.js';
export default class FireStorage extends PubSub {
   constructor() {
     super();
   }
   connectedCallback() {
     this.storageRef = firebase.storage().ref();
   }
   set path(value) {
     this.storageRef.child(value).getDownloadURL().then(url => {
       this.url = url;
       this.publish('change', value);
     });
   }
   set url(value) {
     this._url = value;
   }
   get url() {
     return this._url;
   }
}
customElements.define('fire-storage', FireStorage);
