#!/usr/bin/env node
const gutenbatch = require('./gutenbatch.js');
const program    = require('commander');
const _url       = require('url');

/* Configuration of the command line interface. Look at gutenbatch.js for the
 * script logic. Full usage options can be found at
 * http://github.com/adrianschrader/gutenbatch */
program
  .arguments('<url>')
  .arguments('<output>')
  .option('-a, --auth <auth>',
    'The authentication key from the Thieme website after you\'ve authenticated with your university credentials. ')
  .option('-t, --temp <temp>', 'Path to the temporary directory where the pdf fragments will be stored. Default: output')
  .action(function(url, output) {
    const settings = {
      auth: program.auth,                // Auth key from Thieme website
      source: url,                       // Thieme website url 
      output: program.temp || 'output',  // Directory for pdf files
      mergedFile: output                 // File name for the merged pdf
    };

    /* Parse the source uri */
    settings.sourceUri = _url.parse(settings.source);
    settings.host = settings.sourceUri.protocol + '//' + settings.sourceUri.host;
    settings.uri = settings.sourceUri.pathname;

    gutenbatch(settings);
  })
  .parse(process.argv);
