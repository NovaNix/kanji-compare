function updateCard(card)
{
    let slot = card.getAttribute("data-slot");

    let kanjiInput = card.getElementsByClassName("kanji-input")[0];
    let kanji = kanjiInput.value;

    let kanjiSVGSlot = card.getElementsByClassName("strokes")[0];

    if (kanji.length > 0)
    {
        loadKanji(kanji, slot);
    }

    else
    {
        kanjiSVGSlot.innerHTML = "";
    }
}