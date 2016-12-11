'use strict';
import AppController from './controllers/app-controller.js';

/**
 * @extends AppController
 */
class RgPromote extends AppController {
  /**
   * call super
   */
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
    this.root.innerHTML = `
  <style>
    :host {
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow-y: hidden;
      pointer-events: none;
      position: absolute;
      height: 100%;
      background: #bbb;
    }
  </style>
  <slot></slot>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
  }
}
customElements.define('rg-promote', RgPromote);
