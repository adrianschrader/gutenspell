# gutenbatch

The books in Thieme's online library are fragmented into many different .pdf files, each one containing only a few pages. This script automates the download and merging of these pdfs. You have to be authenticated by your institution, e.g. university, college, employer or Thieme itself.

## Authentication

After you have arrived at the desired download page for the pdf pages, run this bookmarklet in your browser to display the authentication key. The snippet will also generate the complete command necessarry to download all pages.

1. Copy bookmarklet to the clipboard
2. Paste it into the address bar of your browser
3. Copy the generated command to the clipboard
4. Paste command into your terminal and press enter
5. Have lots of cool books to read!

```javascript
javascript:a:!function(){alert('Authentication:\x0a'+$['cookie']('ERIGHTS')+'\x0a\x0aCommand:\x0agutenbatch\x20-a\x20'+$['cookie']('ERIGHTS')+'\x20'+window['location']['href']+'\x20'+$('h1.productTitle')['text']()['replace'](/[^a-z0-9]/gi,'_')['toLowerCase']()+'.pdf');}();
```

## Installation
Download pdftk as a dependency from [here](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) or install it from your package manager of choice. Then:

```bash
yarn install -g
```
