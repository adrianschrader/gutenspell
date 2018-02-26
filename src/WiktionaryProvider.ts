import * as cheerio from 'cheerio';
import * as request from 'request-promise';

const jar = request.jar();

async function getArticle(url: string) {
  // Options to serialize all server responses with cheerio
  const article: CheerioStatic = await request({
    uri: url,
    transform: (body: string) => cheerio.load(body),
    jar,
  });

  // Verify the pulled article is actually from a Wikimedia site
  if (!article('body').hasClass('mediawiki')) {
    throw new Error('The requested page is not a wiki article. ');
  }

  return article;
}

async function extractWordList(article: CheerioStatic): Promise<string[]> {
  /**
   * Wiktionary stores all related words on a topic as links in a list.
   * To exclude unrelated links from navigation, etc. that are also stored in
   * lists, only table rows are included.
   * The desired DOM snippet looks like this:
   * <td><ul><li>
   *    <a class="?">Payload</a>
   * </li></ul></td>
   */
  return article('td > ul > li > a').map((index, node) =>
    article(node).text()).get();
}

/**
 * Gets all the relevant vocabulary from a wiktionary page.
 * @param url Absolute url to the wiki page.
 */
export async function getWordsFromArticle(url: string): Promise<string[]> {
  const article = await getArticle(url);
  const wordList = await extractWordList(article);
  return wordList;
}

/* eslint no-unused-vars: 0, no-undef: 0 */
type WiktionaryUrlParams = {
  language: string;
  page: string;
  type?: string;
};

/**
 * Builds a valid url to a Wiktionary article from an options catalogue
 * @param options Specification of the page and url properties
 */
export function buildWiktionaryUrl(options: WiktionaryUrlParams): string {
  const fullPage = options.type ?
    [options.type, options.page].join(':') :
    options.page;
  return `https://${options.language}.wiktionary.org/wiki/${fullPage}`;
}
