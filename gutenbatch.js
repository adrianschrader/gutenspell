#!/usr/bin/env node
/* Yarn dependencies */
const Promise = require('bluebird');
const request = require('request-promise');
const cheerio = require('cheerio');
const merge = require('pdf-merge');
const stream2promise = require('stream-to-promise');

/* Node dependencies */
const fs = require('fs');
const url = require('url');
const path = require('path');

Promise.promisifyAll(fs);
Promise.promisifyAll(url);
Promise.promisifyAll(path);

const jar = request.jar();

/* Downloads a file from the uri with streams and returns a promise */
const downloadFile = (uri, filename, jar) => 
  fs.statAsync(filename).error(() => {
    const stream = request(uri, { jar }).pipe(fs.createWriteStream(filename));
    return stream2promise(stream);
  });

/* Creates the temporary directory if it not already exists */
const ensureDirectory = (dir) => {
  return fs.statAsync(dir).error(() => {
    console.log('Created temporary output directory at ' + dir);
    return fs.mkdirAsync(dir);
  });
}

module.exports = (settings) => {
  // Create new cookie in the shared jar for all requests
  jar.setCookie('ERIGHTS=' + settings.auth, settings.host);

  // Options to serialize all server responses with cheerio
  const options = {
    uri: settings.source,
    transform: (body) => cheerio.load(body),
    jar
  };

  // Create the temporary output directory
  ensureDirectory(path.resolve(settings.output))

  // Get HTML page from the Thieme server
  .then(() => console.log('Loading metadata for pdf files...'))

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

