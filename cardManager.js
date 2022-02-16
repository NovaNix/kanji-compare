import * as KanjiManager from "./kanjiManager.js";

const cardTemplate = document.getElementById("kanji-card-template");
const cardHolder = document.getElementById("kanji-container");

const defaultKanji = ["日", "月", "人", "入", "水", "氷"];

const maxCards = 6;

const cards = [];

export function createCard()
{
    console.log("Created card!");

    let card = cardTemplate.content.firstElementChild.cloneNode(true);

    let cardNumber = cards.length;

    let cardInput = card.getElementsByClassName("kanji-input")[0];

    // Configure the card
    card.id = "kanji-" + cardNumber;
    card.setAttribute("data-slot", cardNumber);

    cardInput.value = defaultKanji[cardNumber];

    cardInput.addEventListener("input", (event) => updateCard(event.target.parentNode));

    // Add the card to the page

    cards.push(card);
    cardHolder.appendChild(card);

    // Update the card

    updateCard(card);
}

export function updateCard(card)
{
    console.log("Updating card!");

    let slot = card.getAttribute("data-slot");

    let kanjiInput = card.getElementsByClassName("kanji-input")[0];
    let kanji = kanjiInput.value;

    if (kanji.length > 0)
    {
        KanjiManager.loadKanji(kanji, slot);
    }

    else
    {
        clearCard(card);
    }
}

function clearCard(card)
{
    card.getElementsByClassName("strokes")[0].innerHTML = "";

    card.getElementsByClassName("meanings")[0].innerHTML = "";
    card.getElementsByClassName("readings")[0].innerHTML = "";
}

createCard();
createCard();