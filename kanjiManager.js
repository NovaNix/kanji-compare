const parser = new DOMParser();
const serializer = new XMLSerializer();

var dictionaryDoc = loadKanjiData();
const kanjiMap = new Map();

var kanjiLoadPromise;

// Reads from the massive XML file containing all of the information about the kanji (excluding their drawing) and maps them by kanji to make it easier to access that information
// Might be a more efficient way to handle all of this data that I don't know
async function loadKanjiData()
{
    console.log("Loading kanji dictionary...");

    let response = await fetch("./data/kanjidic2.xml");

    if (response.ok)
    {
        console.log("File fetched.");

        let xmlString = await response.text();

        let dictionaryDoc = parser.parseFromString(xmlString, "text/xml");

        let charArray = dictionaryDoc.getElementsByTagName("character");

        for (let i = 0; i < charArray.length; i++)
        {
            let char = charArray[i];
            kanjiMap.set(char.getElementsByTagName("literal")[0].childNodes[0].nodeValue, char);

            //console.log("Added key " + char.getElementsByTagName("literal")[0].childNodes[0].nodeValue);
        }

        console.log("Loaded " + charArray.length + " characters");

        return dictionaryDoc;
    }

    else
    {
        console.error("Failed to load kanji dictionary! " + response.status + ": " + response.statusText);
        return null;
    }
}

function getUnicodeHex(char)
{
    let code = char.charCodeAt(0).toString(16)

    while (code.length < 5)
    {
        code = "0" + code;
    }

    return code;
}

function xmlNodeArrayToString(nodeArray)
{
    let nodeString = "";

    for (let i = 0; i < nodeArray.length; i++)
    {
        nodeString = nodeString + nodeArray[i].childNodes[0].nodeValue;

        if (i < nodeArray.length - 1)
        {
            nodeString = nodeString + ", ";
        }
    }

    return nodeString;
}

function getMeanings(kanjiData)
{
    let nodeString = "";

    let nodeArray = kanjiData.getElementsByTagName("meaning");

    for (let i = 0; i < nodeArray.length; i++)
    {
        node = nodeArray[i];

        if (node.getAttribute("m_lang") == undefined)
        {
            if (i > 0)
            {
                nodeString = nodeString + ", "
            }

            nodeString = nodeString + node.childNodes[0].nodeValue;
        }
    }

    return nodeString;
}

function getReadings(kanjiData)
{
    let nodeString = "";

    let nodeArray = kanjiData.getElementsByTagName("reading");

    let added = 0;

    for (let i = 0; i < nodeArray.length; i++)
    {
        node = nodeArray[i];

        if (node.getAttribute("r_type") == "ja_on")
        {
            if (added > 0)
            {
                nodeString = nodeString + ", "
            }

            nodeString = nodeString + node.childNodes[0].nodeValue;

            added++;
        }
    }

    return nodeString;
}

async function loadKanji(kanji, slot)
{
    let kanjiCode = getUnicodeHex(kanji);

    console.log("Loading Kanji " + kanji);
    console.log("Kanji Code: " + kanjiCode);

    let kanjiResponse = await fetch("https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/" + kanjiCode + ".svg");

    if (kanjiResponse.ok)
    {
        console.log("Successfully got kanji strokes for " + kanji);

        let svgString = await kanjiResponse.text();

        let kanjiDoc = parser.parseFromString(svgString, "image/svg+xml");

        kanjiDoc.getElementById("kvg:StrokeNumbers_" + kanjiCode).remove(); // Remove stroke numbers

        // Configure SVG Node

        let svgNode = kanjiDoc.getElementsByTagName("svg")[0];

        svgNode.removeAttribute("width");
        svgNode.removeAttribute("height");
        svgNode.setAttribute("preserveAspectRatio", "xMidYMid meet");

        let card = document.getElementById("kanji-" + slot);

        card.getElementsByClassName("strokes")[0].innerHTML = serializer.serializeToString(svgNode);

        // Populate Kanji Info

        function waitForData() 
        {
            console.log("Current data state: " + dictionaryDoc);

            if (dictionaryDoc !== "undefined") 
            {
                let kanjiData = kanjiMap.get(kanji);

                card.getElementsByClassName("meanings")[0].innerHTML = getMeanings(kanjiData);
                card.getElementsByClassName("readings")[0].innerHTML = getReadings(kanjiData);

                console.log("Finished loading kanji " + kanji);
            }

            else 
            {
                console.log("Waiting for kanji data to be loaded...");
                setTimeout(waitForData, 250);
            }
        }

        waitForData();

    }

    else
    {
        console.error("Failed to load kanji " + kanji + " properly: " + kanjiResponse.status + ": " + kanjiResponse.statusText);
    }

}

loadKanji("人", 0);
loadKanji("入", 1);