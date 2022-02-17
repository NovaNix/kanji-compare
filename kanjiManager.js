import { KanjiDictionary } from "./kanjiDictionary.js";

const parser = new DOMParser();
const serializer = new XMLSerializer();

const kanjiDictionary = new KanjiDictionary();

// Extracts the hexidecimal unicode value from a character
// Returns a string
function getUnicodeHex(char)
{
    let code = char.charCodeAt(0).toString(16)

    while (code.length < 5)
    {
        code = "0" + code;
    }

    return code;
}

export async function loadKanji(kanji, slot)
{
    let kanjiCode = getUnicodeHex(kanji);

    console.log("Loading Kanji " + kanji);
    //console.log("Kanji Code: " + kanjiCode);

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
        
        let kanjiData = await kanjiDictionary.getKanjiData(kanji);

        if (kanjiData != undefined)
        {
            card.getElementsByClassName("meanings")[0].innerHTML = kanjiData.meanings.toString().replace(/,\s*/g, ", ");
            card.getElementsByClassName("readings")[0].innerHTML = kanjiData.readings.on.toString().replace(/,\s*/g, ", ") + "<br>" + kanjiData.readings.kun.toString().replace(/,\s*/g, ", ");
        }

        else
        {
            console.log("Failed to find data for kanji " + kanji);
        }

        console.log("Finished loading kanji " + kanji);

    }

    else
    {
        console.error("Failed to load kanji " + kanji + " properly: " + kanjiResponse.status + ": " + kanjiResponse.statusText);
    }

}