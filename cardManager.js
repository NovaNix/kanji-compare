import * as KanjiManager from "./kanjiManager.js";

const cardTemplate = document.getElementById("kanji-card-template");
const cardHolder = document.getElementById("kanji-container");

const addCardButton = document.getElementById("add-button");
const removeCardButton = document.getElementById("remove-button");

const defaultKanji = ["日", "月", "人", "入", "水", "氷"];

const maxCards = 6;

const cards = [];

function init()
{
    addCardButton.addEventListener("click", (event) => createCard());
    removeCardButton.addEventListener("click", (event) => removeCard());

    createCard();
    createCard();
}

export function createCard()
{
    if (cards.length < maxCards)
    {
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
        cardHolder.insertBefore(card, cardHolder.lastElementChild);

        // Update the card

        updateCard(card);

        // Update the add and remove buttons

        if (cards.length == maxCards)
        {
            addCardButton.style.display = "none";
        }

        removeCardButton.style.display = "block";
    }
    
}

export function removeCard()
{
    if (cards.length > 0)
    {
        let removedCard = cards.pop();

        cardHolder.removeChild(removedCard);

        // Update the add and remove buttons

        if (cards.length == 0)
        {
            removeCardButton.style.display = "none";
        }

        addCardButton.style.display = "block";
    }
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

// Removes the strokes, meanings, readings, etc from a card
function clearCard(card)
{
    card.getElementsByClassName("strokes")[0].innerHTML = "";

    card.getElementsByClassName("meanings")[0].innerHTML = "";
    card.getElementsByClassName("readings")[0].innerHTML = "";
}

init();