#!/usr/bin/env node
/* Yarn/NPM Dependencies */
const Promise = require('bluebird');
const request = require('request-promise');
const cheerio = require('cheerio');
const stream2promise = require('stream-to-promise');

/* Node Dependencies */
const fs = require('fs');
const url = require('url');
const path = require('path');

// All node apis have to be made to .then() compatible promises
Promise.promisifyAll(fs);
Promise.promisifyAll(url);
Promise.promisifyAll(path);

/* Constant configuration */
// All cookies for authentication will be kept between requests
const jar = request.jar();

module.exports = (settings) => {
  
  // Options to serialize all server responses with cheerio
  const options = {
    uri: settings.source,
    transform: (body) => cheerio.load(body),
    jar
  };

  // Get HTML pa
  .then(() => request(options))

  .then(function ($) {
    // Extract only the PDF links, not other HTML files
    const links = $('li.option a').map(
      (i, el) => $(el).html().includes('PDF') ? settings.host + $(el).attr('href') : undefined
    ).get();

    // Download all files into the temp directory
    return Promise.reduce(links, (paths, link) => {
      // Filenames are generated from the url
      const filename = url.parse(link).pathname.split('/').pop();
      const filepath = path.resolve(settings.output + '/' + filename);
      paths.push(filepath);

      console.log('Downloading %s (%s/%s)...', filename, paths.length, links.length);
      return downloadFile(link, filepath, jar).then(() => paths);
    }, []);
  })
  .then((paths) => {
    console.log('Merging %s pdf files...', paths.length);

    // Merge pdf files with pdftk server cli as a dependency
    return merge(paths, { output: path.resolve(settings.output + '/' + settings.mergedFile) }).then(() =>
      console.log('Success!')
    );
  })
  // Display all errors in the command line. No handling at this point.
  .catch(console.error);
};

