'use strict';
import RgHeader from './../ui/rg-header.js';
import RgDocument from './../ui/rg-document.js';
import FirebaseController from './firebase-controller.js';
import FireData from './fire-data.js';
'@AutoScroller'

export default class AppController extends FirebaseController {
   static get observedAttributes() {
     return []
   }
   /**
    * Calls super
    */
   constructor() {
     super();
     this._onDataChange = this._onDataChange.bind(this);
   }
   /**
    * Runs when inserted into dom
    */
   connectedCallback() {
     super.connectedCallback();
     document.addEventListener('firebase-ready', () => {
       this.data = new FireData();
       this.data.subscribe('promoter.change', this._onDataChange);
       this.appendChild(this.data);
     });
     this.header = new RgHeader();
     this.document = new RgDocument();
     this.appendChild(this.header);
     this.appendChild(this.document);
     this.scroller = new AutoScroller({target: this.document});
     this.document.addEventListener('page-rendered', () => {
       setTimeout(() => {
         this.scroller.rerender();
       }, 500);
     });
   }
   _onDataChange(change) {
     this.documentScroller = this.data.promoterData.documentScroller;
     this.document.renderImages(this.documentScroller.src);
   }
}
customElements.define('app-controller', AppController)
