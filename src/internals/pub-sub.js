export default class PubSub extends HTMLElement {
  constructor() {
    super();
    this.handlers = [];
  }

  subscribe(event, handler, context) {
   if (typeof context === 'undefined') {
     context = handler;
   }

   this.handlers.push({event: event, handler: handler.bind(context)});
  }

  publish(event) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].event === event) {
        this.handlers[i].handler.call();
      }
    }
  }
}
customElements.define('pub-sub', PubSub);
