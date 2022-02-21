import * as KanjiDictionary from "./kanjiDictionary.js";
import * as CardManager from "./cardManager.js";
import * as StrokeManager from "./strokeManager.js";

const serializer = new XMLSerializer();

export async function loadKanji(kanjiChar, slot)
{
    let card = CardManager.getCard(slot);

    let svgNode = await StrokeManager.loadStrokes(kanjiChar);

    card.getElementsByClassName("strokes")[0].innerHTML = serializer.serializeToString(svgNode);

    // Populate Kanji Info

    let kanjiData = await KanjiDictionary.getKanjiData(kanjiChar);

    if (kanjiData != undefined)
    {
        CardManager.populateCardData(slot, kanjiData);
    }

    else
    {
        console.log("Failed to find data for kanji " + kanjiChar);
    }

    console.log("Finished loading kanji " + kanjiChar);
}