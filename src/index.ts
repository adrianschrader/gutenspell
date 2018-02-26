#!/usr/bin/env node
import * as commander from 'commander';
import * as ora from 'ora';
import { writeDictionaryFromWords } from './DictionaryUtil';
import { getWordsFromArticle } from './WiktionaryProvider';

const fullHttpsUrl = /^(https?:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
const spinner = ora('Initializing...');

function message(msg) {
  console.log('');
  spinner.text = msg;
}

async function main(url: string) {
  if (!url || !url.match(fullHttpsUrl)) {
    throw new Error('You have to provide a valid url. ');
  }
  if (commander.output && commander.output.length < 3) {
    throw new Error('File names have to be at least three characters long. ');
  }

  spinner.start();
  message('Loading wiki article...');
  const wordList = await getWordsFromArticle(url);

  if (commander.output) {
    message('Creating .dict file...');
    await writeDictionaryFromWords(commander.output, wordList);
  } else {
    message('Dumping vocabulary in stdout. Use -o to save output in file. ');
    spinner.stop();
    wordList.forEach(value => console.log(value));
  }
  message(''); // The last message won't be saved, so it is just a dummy. Keep!
  spinner.stop();
}

commander
  .arguments('<url>')
  .option(
    '-o --output <filename>',
    'Save all extracted words into this txt file. ',
  )
  .action((url: string) => {
    main(url).catch((error: Error) => {
      spinner.stop();
      console.log(`ERROR: ${error.message}`);
    });
  })
  .parse(process.argv);
