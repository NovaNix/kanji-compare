const parser = new DOMParser();
const serializer = new XMLSerializer();

var dictionaryDoc;
const kanjiMap = new Map();
const partLookup = new Map();
const definitionLookup = new Map();

var dictionaryPromise;
var definitionLookupPromise;
var kradfile1Promise;
var kradfile2Promise;

// Responsible for storing and providing access to kanji readings, meanings, etc
export class KanjiDictionary
{
    constructor()
    {
        this.load();
    }


    async load()
    {
        if (dictionaryPromise == undefined)
            dictionaryPromise = this.loadDictionary();
        
        if (kradfile1Promise == undefined)
            kradfile1Promise = this.loadPartLookup("kradfileUnicode");
        if (kradfile2Promise == undefined)
            kradfile2Promise = this.loadPartLookup("kradfile2Unicode");
        
        if (definitionLookupPromise == undefined)
            definitionLookupPromise = this.generateDefinitionLookup();
    }

    // Reads from the massive XML file containing all of the information about the kanji (excluding their drawing) and maps them by kanji to make it easier to access that information
    // Might be a more efficient way to handle all of this data that I don't know
    async loadDictionary()
    {
        console.log("Loading Kanji Dictionary...");

        let response = await fetch("./data/kanjidic2.xml");

        if (response.ok) 
        {
            console.log("Kanji Dictionary XML Fetched. Loading characters...");

            let xmlString = await response.text();

            dictionaryDoc = parser.parseFromString(xmlString, "text/xml");

            let charArray = dictionaryDoc.getElementsByTagName("character");

            for (let i = 0; i < charArray.length; i++) 
            {
                let char = charArray[i];
                kanjiMap.set(char.getElementsByTagName("literal")[0].childNodes[0].nodeValue, char);
            }

            console.log("Loaded " + charArray.length + " characters");
        }

        else 
        {
            console.error("Failed to load kanji dictionary! " + response.status + ": " + response.statusText);
            return null;
        }
    }

    async generateDefinitionLookup()
    {
        await dictionaryPromise;

        console.log("Generating Definition Lookup");

        let kanjis = kanjiMap.keys();

        for (const kanji of kanjis)
        {
            let definitions = await this.getMeanings(kanjiMap.get(kanji));

            //console.log(`Definitions for kanji ${kanji} are ${definitions}`);

            for (let i = 0; i < definitions.length; i++)
            {
                let definition = definitions[i];

                if (definitionLookup.has(definition))
                {
                    let kanjiArray = definitionLookup.get(definition);

                    kanjiArray.push(kanji);
                }

                else
                {
                    definitionLookup.set(definition, [kanji]);
                }
            }
        }

        console.log("Mapped kanji to " + definitionLookup.size + " definitions");
    }

    // Loads the two kradfiles. The version can either be kradfileUnicode or kradfile2Unicode
    async loadPartLookup(version)
    {
        
        let response = await fetch(`./data/${version}.txt`);

        if (response.ok) 
        {
            console.log("Loaded Test Part Lookup");

            let lookupFile = await response.text();

            let lines = lookupFile.matchAll(/^(.) : (.*)/gmu);
        
            let numLoaded = 0;

            for (const match of lines) 
            {
                let kanji = match[1];

                let parts = match[2].match(/\S/gu);

                partLookup.set(kanji, parts);

                numLoaded++;
            }

            console.info("Loaded " + numLoaded + " Kanji with parts");
        }

        else 
        {
            console.error("Failed to Load Part Lookup File! " + response.status + ": " + response.statusText);
            return null;
        }


    }

    // Returns a string array of meanings
    async getMeanings(kanjiNode)
    {
        await dictionaryPromise;

        let meanings = [];

        let nodeArray = kanjiNode.getElementsByTagName("meaning");

        for (let i = 0; i < nodeArray.length; i++) 
        {
            let node = nodeArray[i];

            if (node.getAttribute("m_lang") == undefined) 
            {
                meanings.push(node.childNodes[0].nodeValue);
            }
        }

        return meanings;
    }

    async getReadings(kanjiNode, readingType)
    {
        await dictionaryPromise;

        let readings = [];

        let nodeArray = kanjiNode.getElementsByTagName("reading");

        for (let i = 0; i < nodeArray.length; i++) 
        {
            let node = nodeArray[i];

            if (node.getAttribute("r_type") == readingType) 
            {
                readings.push(node.childNodes[0].nodeValue);
            }
        }

        return readings;
    }

    async getKanjiData(kanji)
    {
        await dictionaryPromise;

        // Handle any potential non-kanji characters that appear
        
        if (!kanjiMap.has(kanji))
        {
            return undefined;
        }

        let kanjiNode = kanjiMap.get(kanji);

        let data = 
        {
            node: kanjiNode,

            meanings: await this.getMeanings(kanjiNode),

            readings: {
                on: await this.getReadings(kanjiNode, "ja_on"),
                kun: await this.getReadings(kanjiNode, "ja_kun")
            }

        };

        return data;
    }

}
