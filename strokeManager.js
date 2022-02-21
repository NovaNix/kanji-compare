

const parser = new DOMParser();

const strokeTypes = [
    "㇔",
    "㇐",
    "㇑",
    "㇒",
    "㇏",
    "㇀",
    "㇖",
    "㇚",
    "㇂",
    "㇙",
    "㇕",
    "㇗",
    "㇛",
    "㇜",
    "㇇",
    "㇄",
    "㇆",
    "㇟",
    "㇊",
    "㇉",
    "㇋",
    "㇌",
    "㇈",
    "㇅",
    "㇞"
];

// Extracts the hexidecimal unicode value from a character
// Returns a string
export function getUnicodeHex(char)
{
    let code = char.charCodeAt(0).toString(16)

    while (code.length < 5)
    {
        code = "0" + code;
    }

    return code;
}

export async function loadStrokes(kanji)
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

        // console.log("Dumping kanji strokes: " + kanji);

        // let strokes = svgNode.getElementsByTagName("path");

        // for (let i = 0; i < strokes.length; i++)
        // {
        //     console.log(`${strokes[i].getAttribute("id")}: ${strokes[i].getAttribute("kvg:type")}`);
        // }

        return svgNode;
    }

    else
    {
        console.error("Failed to load kanji " + kanji + " properly: " + kanjiResponse.status + ": " + kanjiResponse.statusText);

        return null;
    }
}

function processStrokeSVG(svgNode)
{

}