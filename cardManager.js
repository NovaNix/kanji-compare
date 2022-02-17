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

export function removeCard(card)
{
    if (cards.length > 0)
    {
        let removedCard;

        if (card == undefined)
        {
            removedCard = cards.pop();
        }

        else
        {
            removedCard = cards.splice(cards.indexOf(card), 1)[0];
        }

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

export function populateCardData(slot, data)
{
    let card = document.getElementById("kanji-" + slot);

    let meaningsSection = card.getElementsByClassName("meanings")[0];
    let onReadingsSection = card.getElementsByClassName("on-readings")[0];
    let kunReadingsSection = card.getElementsByClassName("kun-readings")[0];

    let meanings = data.meanings;

    let onReadings = data.readings.on;
    let kunReadings = data.readings.kun;

    for (const meaning of meanings)
    {
        let meaningTag = document.createElement("span");

        meaningTag.innerHTML = meaning;
        meaningTag.classList.add("meaning-tag");
        meaningTag.classList.add("data-tag");
        

        meaningsSection.appendChild(meaningTag);
    }

    for (const reading of onReadings)
    {
        let readingTag = document.createElement("span");

        readingTag.innerHTML = reading;
        readingTag.classList.add("reading-tag");
        readingTag.classList.add("on-reading-tag");
        readingTag.classList.add("data-tag");

        onReadingsSection.appendChild(readingTag);
    }

    for (const reading of kunReadings)
    {
        let readingTag = document.createElement("span");

        readingTag.innerHTML = reading;
        readingTag.classList.add("reading-tag");
        readingTag.classList.add("kun-reading-tag");
        readingTag.classList.add("data-tag");

        kunReadingsSection.appendChild(readingTag);
    }

    //.innerHTML = .toString().replace(/,\s*/g, ", ");
    //card.getElementsByClassName("readings")[0].innerHTML = data.readings.on.toString().replace(/,\s*/g, ", ") + "<br>" + data.readings.kun.toString().replace(/,\s*/g, ", ");
}

// Removes the strokes, meanings, readings, etc from a card
function clearCard(card)
{
    card.getElementsByClassName("strokes")[0].innerHTML = "";

    card.getElementsByClassName("meanings")[0].innerHTML = "";
    card.getElementsByClassName("readings")[0].innerHTML = "";
}

init();