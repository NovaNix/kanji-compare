const parser = new DOMParser();
const serializer = new XMLSerializer();

const kanjiMap = new Map();
var dictionaryDoc;

// Responsible for storing and providing access to kanji readings, meanings, etc
export class KanjiDictionary
{
    constructor()
    {
        if (dictionaryDoc == undefined)
        {
            dictionaryDoc = this.load();
        }
    }

    // Reads from the massive XML file containing all of the information about the kanji (excluding their drawing) and maps them by kanji to make it easier to access that information
    // Might be a more efficient way to handle all of this data that I don't know
    async load()
    {
        console.log("Loading Kanji Dictionary...");

        let response = await fetch("./data/kanjidic2.xml");

        if (response.ok) 
        {
            console.log("Kanji Dictionary XML Fetched. Loading characters...");

            let xmlString = await response.text();

            let doc = parser.parseFromString(xmlString, "text/xml");

            let charArray = doc.getElementsByTagName("character");

            for (let i = 0; i < charArray.length; i++) 
            {
                let char = charArray[i];
                kanjiMap.set(char.getElementsByTagName("literal")[0].childNodes[0].nodeValue, char);
            }

            console.log("Loaded " + charArray.length + " characters");

            return doc;
        }

        else 
        {
            console.error("Failed to load kanji dictionary! " + response.status + ": " + response.statusText);
            return null;
        }
    }

    // Returns a string array of meanings
    async getMeanings(kanjiNode)
    {
        await dictionaryDoc;

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
        await dictionaryDoc;

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
        await dictionaryDoc;

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
