
// Responsible for storing and providing access to kanji readings, meanings, etc

const parser = new DOMParser();
const serializer = new XMLSerializer();

const dataMap = loadData();
const definitionLookup = generateDefinitionLookup();

async function loadData()
{
    let kanjiNodes = await loadDictionary();
    let parts = await loadKradfile();

    // Returns a string array of meanings
    async function getMeanings(kanjiNode)
    {
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

    async function getReadings(kanjiNode, readingType)
    {
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

    let kanjiData = new Map();

    for (const kanji of kanjiNodes.keys())
    {
        let kanjiNode = kanjiNodes.get(kanji); 

        let data =
        {
            node: kanjiNode,

            kanjiChar: kanji,

            meanings: await getMeanings(kanjiNode),

            readings: {
                on: await getReadings(kanjiNode, "ja_on"),
                kun: await getReadings(kanjiNode, "ja_kun")
            },

            parts: parts.get(kanji)

        };

        kanjiData.set(kanji, data);
    }

    return kanjiData;

}

// Reads from the massive XML file containing all of the information about the kanji (excluding their drawing) and maps them by kanji to make it easier to access that information
// Might be a more efficient way to handle all of this data that I don't know
async function loadDictionary()
{
    console.log("Loading Kanji Dictionary...");

    let response = await fetch("./data/kanjidic2.xml");

    if (response.ok) 
    {
        console.log("Kanji Dictionary XML Fetched. Loading characters...");

        let kanjiMap = new Map();

        let xmlString = await response.text();

        let dictionaryDoc = parser.parseFromString(xmlString, "text/xml");

        let charArray = dictionaryDoc.getElementsByTagName("character");

        for (let i = 0; i < charArray.length; i++) 
        {
            let char = charArray[i];
            kanjiMap.set(char.getElementsByTagName("literal")[0].childNodes[0].nodeValue, char);
        }

        console.log("Loaded " + charArray.length + " characters");

        return kanjiMap;
    }

    else 
    {
        console.error("Failed to load kanji dictionary! " + response.status + ": " + response.statusText);
        return null;
    }
}

// Loads the kradfile
async function loadKradfile()
{

    let response = await fetch("./data/kradfile-u.gz");

    if (response.ok)
    {
        console.log("Fetched Kradfile. Loading contents...");

        let lookupFile = await response.text();

        let lines = lookupFile.matchAll(/^(.) : (.*)/gmu);

        let partLookup = new Map();

        let numLoaded = 0;

        for (const match of lines)
        {
            let kanji = match[1];
            let parts = match[2].match(/\S/gu);

            partLookup.set(kanji, parts);

            numLoaded++;
        }

        console.info("Loaded " + numLoaded + " Kanji Elements from Kradfile");

        return partLookup;
    }

    else
    {
        console.error("Failed to Load Part Lookup File! " + response.status + ": " + response.statusText);
        return null;
    }


}

async function generateDefinitionLookup()
{
    console.log("Generating Definition Lookup");

    let kanjis = (await dataMap).keys();

    let meaningLookup = new Map();

    for (const kanjiChar of kanjis)
    {
        let definitions = (await dataMap).get(kanjiChar).meanings;

        //console.log(`Definitions for kanji ${kanji} are ${definitions}`);

        for (let i = 0; i < definitions.length; i++)
        {
            let definition = definitions[i];

            if (meaningLookup.has(definition))
            {
                let kanjiArray = meaningLookup.get(definition);

                kanjiArray.push(kanjiChar);
            }

            else
            {
                meaningLookup.set(definition, [kanjiChar]);
            }
        }
    }

    console.log("Mapped kanji to " + meaningLookup.size + " definitions");

    return meaningLookup;
}

export async function getKanjiData(kanjiChar)
{
    return (await dataMap).get(kanjiChar);
}

// Returns of two parts are "equivelent"
export async function compareParts(part1, part2)
{
    if (part1 == part2)
    {
        return true;
    }

    let parts1 = await getEquivelentParts(part1);
    let parts2 = await getEquivelentParts(part2);

    for (const part of parts1)
    {
        if (parts2.includes(part))
        {
            return true;
        }
    }

    return false;

}

async function getEquivelentParts(part, higherParts = [])
{
    higherParts.push(part);
    let data = (await getKanjiData(part));
    
    if (data == undefined)
    {
        console.log("Found no sub parts! This might be a mistake! Part was " + part);
        return higherParts;
    }

    let subParts = data.parts;

    if (subParts == undefined)
    {
        console.log("Found no sub parts! This might be a mistake! Part was " + part);
        return higherParts;
    }

    if (subParts.length == 1)
    {
        if (subParts[0] == part)
        {
            return higherParts;
        }

        else
        {
            return getEquivelentParts(subParts[0], higherParts);
        }
    }

    else
    {
        return higherParts;
    }

}


