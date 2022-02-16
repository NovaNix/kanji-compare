const parser = new DOMParser();
const serializer = new XMLSerializer();

const kanjiMap = new Map();
var dictionaryDoc;

// Responsible for storing and providing access to kanji readings, meanings, etc
class KanjiDictionary
{
    constructor()
    {
        if (dictionaryDoc == undefined)
        {
            dictionaryDoc = load();
        }
    }

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
            node = nodeArray[i];

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
            node = nodeArray[i];

            if (node.getAttribute("r_type") == readingType) 
            {
                readings.push(node.childNodes[0].nodeValue);
            }
        }

        return readings;
    }


}

class KanjiData
{
    constructor(dictionary, kanji)
    {

        this.node = kanjiMap.get(kanji);

        //this.readings = 
    }
}

