import { expect } from 'chai';
import * as WiktionaryProvider from './WiktionaryProvider';

describe('WiktionaryProvider', () => {
    it('generates a german url with page and lang', () => {
        const url = WiktionaryProvider.buildWiktionaryUrl({
            language: 'de',
            page: 'Verzeichnis:Deutsch/Medizin'
        });

        expect(url).to.equal('https://de.wiktionary.org/wiki/Verzeichnis:Deutsch/Medizin');
    });
    
    it('generates an english url with page and lang', () => {
        const url = WiktionaryProvider.buildWiktionaryUrl({
            language: 'en',
            page: 'Category:de:Neurology'
        });

        expect(url).to.equal('https://en.wiktionary.org/wiki/Category:de:Neurology');
    });
   
    it('generates an english url with page, lang and type', () => {
        const url = WiktionaryProvider.buildWiktionaryUrl({
            language: 'en',
            page: 'de:Neurology',
            type: 'Category'
        });

        expect(url).to.equal('https://en.wiktionary.org/wiki/Category:de:Neurology');
    });
});