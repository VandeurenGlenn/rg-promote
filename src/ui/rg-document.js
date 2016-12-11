'use strict';
import PdfToObjectURL from './../internals/pdf-to-object-url.js';
import PubSub from './../internals/pub-sub.js';

export default class RgDocument extends HTMLElement {
   /**
    * Calls super
    */
   constructor() {
     super();
     this.root = this.attachShadow({mode: 'open'});
     this._renderPage = this._renderPage.bind(this);
     this.pdfToObjectURL = new PdfToObjectURL();
     this.pubsub = new PubSub();
   }
   /**
    * Runs when inserted into dom
    */
   connectedCallback() {
     this.root.innerHTML = `
     <style>
       :host {
         display: flex;
         flex-direction: column;
         width: 100%;
         align-items: center;
         will-change: transform;
       }
       .container {
         width: var(--rg-document-container-width, 1024px);
         box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                     0 1px 5px 0 rgba(0, 0, 0, 0.12),
                     0 3px 1px -2px rgba(0, 0, 0, 0.2);
       }
     </style>
     <div class="container">
        <slot></slot>
     </div>
     `;     
     this._renderTasks = [];
     this._loadScript('bower_components/pdfjs/pdf.js').then(() => {
       PDFJS.disableWorker = true;
       PDFJS.workerSrc = 'bower_components/pdfjs/pdf.worker.js';
    });
   }
   renderImages(path) {
     let calls = 0;
     const viewportWidth = 1024;
     const cb = page => {
       let numPages = page.numPages;
       this._renderTasks[page.index] = page;
       calls += 1;
       if (calls === numPages) {
         for (let task of this._renderTasks) {
           if (task.index === 0) {
             this._renderImage(task);
           } else {
             setTimeout(() => {
               this._renderImage(task);
             }, 500);
           }
         }
       }
     }

     this.pdfToObjectURL.convert(path, viewportWidth, cb.bind(this))
   }
   _renderImage(page) {
     let width = page.viewport.width;
     let img = document.createElement('img');
     img.width = width;
     img.height = page.viewport.height;
     img.src = page.src;

     requestAnimationFrame(() => {
       this.appendChild(img);
       this.dispatchEvent(new CustomEvent('page-rendered'));
       this.style.setProperty('--rg-document-container-width', `${width}px`);
     });
   }
   _renderPages(pdf) {
     for(let num = 1; num <= pdf.numPages; num++)
            pdf.getPage(num).then(this._renderPage);
   }

   _renderPage(page) {

      let viewport = page.getViewport(1);
      let canvas = this.root.querySelector('canvas');
      let ctx = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      let renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      page.render(renderContext);
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
customElements.define('rg-document', RgDocument)
