'use strict';

export default class FirebaseController extends HTMLElement {
   static get observedAttributes() {
     return ['firebase-ready'];
   }
   constructor() {
     super();
     this._onFirebaseReady = this._onFirebaseReady.bind(this);
   }

   connectedCallback() {
     let scripts = [
       this._loadScript('bower_components/firebase/firebase-app.js'),
       this._loadScript('bower_components/firebase/firebase-database.js')
     ];
     Promise.all(scripts).then(() => {
       // Initialize Firebase
       var config = {
         apiKey: 'AIzaSyAbYzWIWsmqEBvNtmOxwsKPJRcm25HkHLw',
         databaseURL: 'https://reefgems.firebaseio.com'
       };
       firebase.initializeApp(config);
       this.firebaseReady = true;
     });
   }

   get firebaseReady() {
     return this.hasAttribute('firebase-ready');
   }

   set firebaseReady(value) {
     if (value) {
       this.setAttribute('firebase-ready', '');
       this._onFirebaseReady();
     } else {
       this.removeAttribute('firebase-ready');
     }
   }

   attributeChangedCallback(name, oldVal, newVal) {
     if (oldVal !== newVal) {
       this[this._toJsProp(name)] = newVal;
     }
   }

   _toJsProp(string) {
     var parts = string.split('-');
     if (parts.length > 1) {
       var upper = parts[1].charAt(0).toUpperCase();
       string =  parts[0] + upper + parts[1].slice(1).toLowerCase();
     }
     return string;
   }

   _onFirebaseReady() {
     document.dispatchEvent(new CustomEvent('firebase-ready'));
    //  new StorageController();
   }

   _loadScript(src) {
     return new Promise((resolve, reject) => {
       let script = document.createElement('script');
       script.src = src;
       script.onload = () => {
         resolve();
       };
       script.setAttribute('async', '');
       let target = this.root || this;
       target.appendChild(script);
     });
   }
}
customElements.define('firebase-controller', FirebaseController)
