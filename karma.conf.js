// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: { clearContext: false },
    reporters: ['progress', 'kjhtml', 'coverage'],
    coverageReporter: {
      // Escribe SIEMPRE en ./coverage (sin subcarpetas)
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'json-summary', file: 'coverage-final.json' }, // <-- el que busca tu workflow
        { type: 'lcovonly',     file: 'lcov.info' },
        { type: 'text-summary' }
      ],
      fixWebpackSourcePaths: true
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-dev-shm-usage']
      }
    },
    singleRun: true,
    restartOnFileChange: false
  });
};
