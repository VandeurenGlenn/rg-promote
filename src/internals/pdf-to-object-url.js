'use strict';
export default class PdfToObjectURL {
  constructor(opts={viewportWidth: 1024}) {
    this.viewportWidth = opts.viewportWidth;
    this._revoke = this._revoke.bind(this);
  }

  convert(path, viewportWidth, cb) {
    // provide promise all option?
    this._getBlob(path).then(blob => {
      this._readBlob(blob).then(result => {
        this._getDocument(result, viewportWidth, cb);
      })
    });
  }

  _getBlob(path) {
    return new Promise((resolve, reject) => {
      fetch(path).then(response => {
        return response.blob();
      }).then(blob => {
        resolve(blob);
      }).catch(error => {
        reject(error);
      });
    });
  }

  _readBlob(blob) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader()
      reader.onload = event => {
        resolve(event.target.result);
      }
      reader.onerror = error => {
        reject(error);
      }
      reader.readAsArrayBuffer(blob);
    });
  }

  _getDocument(input, viewportWidth, cb) {
    let calls = 0
    PDFJS.getDocument(input).then(pdf => {
      // fetch each page
      let numPages = pdf.numPages;
      for (var num = 1; num <= numPages; num++) {

        pdf.getPage(num).then((page) => this._pageToDataURL(page, viewportWidth, result => {
          result.numPages = numPages;
          cb(result);
        }))
      }
    })
  }

  _pageToDataURL (page, viewportWidth, cb) {
    // scale page to pageWidth / width
    let viewport = page.getViewport(viewportWidth / page.view[2])
    let canvasElem = document.createElement('canvas')
    canvasElem.width = viewport.width
    canvasElem.height = viewport.height
    let canvasContext = canvasElem.getContext('2d')
    page.render({canvasContext, viewport}).then(() => {
      canvasElem.toBlob(blob => {
        cb({
          src: URL.createObjectURL(blob),
          index: page.pageIndex,
          viewport: viewport,
          onload: this._revoke
        })
      });
      // pass index as each image is rendered async

    });
  }

  _revoke(url) {
    URL.revokeObjectURL(url);
  }
}
