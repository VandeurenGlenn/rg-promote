'use strict';
const {task, src, dest, series} = require('gulp');
const {readFileSync, writeFileSync} = require('fs');
const {base64Sync} = require('base64-img');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
const del = require('del');
const lwip = require('gulp-lwip');

// used to track the cache for subsequent bundles
let cache;

// end
let inject = (tasks, cb) => {
  let calls = 0;
  let need = option => {
    console.error(`${option}::undefined`);
  }
  for (let task of tasks) {
    let sources = task.sources || task.src || need('sources');
    calls += 1;
    for (let source of sources) {
      let dest = task.dest || source;
      let file = readFileSync(source).toString();
      file = file.replace(task.tag, task.inject);
      writeFileSync(dest, file);
      if (calls === tasks.length) {
        cb();
      }
    }
  }
}

task('images:resize', () => {
  return src('./src/sources/logo.png')
  .pipe(lwip
      // .resize(100, 84)
      .crop(200, 0, 0, 86)
      .scale(0.7)
      .exportAs('png')
  )
  .pipe(dest('./.tmp/sources'));
});

task('images:inject', cb => {
  let images = [{
    src: ['./dist/rg-promote.js'],
    tag: '@logo',
    inject: base64Sync('./.tmp/sources/logo.png')
  }]
  return inject(images, cb);
 });

 task('scripts:inject', cb => {
   let scripts = [{
     src: ['src/controllers/app-controller.js'],
     tag: "'@AutoScroller'",
     inject: readFileSync('./node_modules/auto-scroller/dist/index.js')
     .toString().replace('module.exports = AutoScroller', ''),
     dest: '.tmp/controllers/app-controller.js'
   },{
     src: ['src/ui/rg-document.js'],
     tag: "'@pdfToDataURL'",
     inject: readFileSync('./node_modules/pdf-to-dataURL/index.es6')
     .toString().replace('module.exports = pdfToDataURL', ''),
     dest: '.tmp/ui/rg-document.js'
   }]
   return inject(scripts, cb);
  });

 task('rollup', () => {
   return rollup({
     entry: './.tmp/rg-promote.js',
     // Use the previous bundle as starting point.
     cache: cache
   }).then(bundle => {
      var result = bundle.generate({
        // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
        format: 'cjs',
        plugins: [babel()]
      });
     // Cache our bundle for later use (optional)
     cache = bundle;

     writeFileSync('dist/rg-promote.js', result.code);
   });
 });

task('copy:app', () => {
  return src([
    'src/index.html',
    'src/favicon.ico',
    'src/manifest.json'
  ]).pipe(dest('dist'));
});

task('copy:icons', () => {
  return src([
    'src/sources/icons/**'
  ]).pipe(dest('dist/sources/icons'));
});

task('copy:bower_components', () => {
  return src([
    'bower_components/**/*.{js,html}', 'bower_components/**/**/**/*.{js,html}'
  ]).pipe(dest('dist/bower_components'));
});

task('copy:pdfjs', () => {
  return src([
    'bower_components/pdfjs-dist/build/{pdf,pdf.worker}.js'
  ]).pipe(dest('dist/bower_components/pdfjs'));
});

task('copy:tmp', () => {
  return src([
    'src/**/*.js'
  ]).pipe(dest('.tmp'));
 });

task('timeout', cb => {
  setTimeout(() => {
    cb();
  }, 10);
});
task('clean', cb => {
  del(['dist', '.tmp']).then(cb());
})
task('copy', series('copy:tmp', 'copy:app', 'copy:bower_components', 'copy:pdfjs', 'copy:icons'));
task('images', series('images:resize', 'images:inject'));
task('scripts', series('scripts:inject'));
task('build', series('clean', series('copy', 'timeout', 'scripts', 'rollup', 'images')));
