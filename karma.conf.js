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
    client: {
      clearContext: false
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'json-summary', file: 'coverage-final.json' },
        { type: 'lcovonly', file: 'lcov.info' },
        { type: 'text-summary' }
      ],
      fixWebpackSourcePaths: true
    },
    browsers: ['ChromeHeadless'],
    singleRun: true,
    restartOnFileChange: false
  });
};
