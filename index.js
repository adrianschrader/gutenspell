#!/usr/bin/env node
const gutenbatch = require('./gutenbatch.js');
const program = require('commander');
const _url = require('url');

program
  .arguments('<url>')
  .arguments('<output>')
  .option('-a, --auth <auth>',
    'The authentication key from the Thieme website after you\'ve authenticated with your university credentials. ')
  .option('-t, --temp <temp>', 'Path to the temporary directory where the pdf fragments will be stored. Default: output')
  .action(function(url, output) {
    const settings = {
      auth: program.auth,
      source: url,
      output: program.temp || 'output',
      mergedFile: output
    };
    settings.sourceUri = _url.parse(settings.source);
    settings.host = settings.sourceUri.protocol + '//' + settings.sourceUri.host;
    settings.uri = settings.sourceUri.pathname;

    gutenbatch(settings);
  })
  .parse(process.argv);
