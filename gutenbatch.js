#!/usr/bin/env node
const Promise = require('bluebird');
const request = require('request-promise');
const cheerio = require('cheerio'); // Basically jQuery for node.js
const path = require('path');
const fs = require('fs');
const url = require('url');
const merge = require('pdf-merge');

module.exports = (settings) => {
  const jar = request.jar();
  jar.setCookie('ERIGHTS=' + settings.auth, settings.host);

  const options = {
    uri: settings.host + settings.uri,
    transform: function (body) {
        return cheerio.load(body);
    },
    jar
  };

  const downloadFile = (uri, filename) => new Promise((resolve, reject) => {
    fs.stat(filename, function(err, stat) {
      if (err == null)
        resolve();
      else {
        request(uri, { jar })
        .pipe(fs.createWriteStream(filename))
        .on('finish', () => {
          resolve();
        });
      }
    });
  });

  const outputDir = path.resolve(settings.output);
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
    console.log('Created temporary output directory in ' + outputDir);
  }

  console.log('Loading metadata for pdf files...');

  request(options)
  .then(function ($) {
    const links = $('li.option a').map(
      (i, el) => $(el).html().includes('PDF') ? settings.host + $(el).attr('href') : undefined
    ).get();

    return Promise.reduce(links, (paths, link) => {
      const filename = url.parse(link).pathname.split('/').pop();
      const filepath = path.resolve(settings.output + '/' + filename);
      paths.push(filepath);

      console.log('Downloading %s (%s/%s)...', filename, paths.length, links.length);
      return downloadFile(link, filepath).then(() => paths);
    }, []);
  })
  .then((paths) => {
    console.log('Merging %s pdf files...', paths.length);
    return merge(paths, { output: path.resolve(settings.output + '/' + settings.mergedFile) }).then(() =>
      console.log('Success!')
    );
  })
  .catch(console.error);
};
