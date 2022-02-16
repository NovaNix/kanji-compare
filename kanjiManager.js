const serializer = new XMLSerializer();

function getUnicodeHex(char)
{
    let code = char.charCodeAt(0).toString(16)

    while (code.length < 5)
    {
        code = "0" + code;
    }

    return code;
}

async function loadKanji(kanji, slot)
{
    let kanjiCode = getUnicodeHex(kanji);

    console.log("Loading Kanji " + kanji);
    console.log("Kanji Code: " + kanjiCode);

    let kanjiResponse = await fetch("https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/" + kanjiCode + ".svg");

    if (kanjiResponse.ok)
    {
        console.log("Loaded kanji " + kanji + " properly");
    }

    else
    {
        console.error("Failed to load kanji " + kanji + " properly: " + kanjiResponse.status + ": " + kanjiResponse.statusText);
    }

    let svgString = await kanjiResponse.text();

    console.log("Response text: " + svgString);

    const parser = new DOMParser();
    let kanjiDoc = parser.parseFromString(svgString, "image/svg+xml");

    kanjiDoc.getElementById("kvg:StrokeNumbers_" + kanjiCode).remove(); // Remove stroke numbers

    let svgNode = kanjiDoc.getElementsByTagName("svg")[0];

    svgNode.removeAttribute("width");
    svgNode.removeAttribute("height");
    svgNode.setAttribute("preserveAspectRatio", "xMidYMid meet");
    //svgNode.height = "";

    document.getElementById("kanji-" + slot).getElementsByClassName("strokes")[0].innerHTML = serializer.serializeToString(svgNode);
}

loadKanji("日", 0);
loadKanji("月", 1);