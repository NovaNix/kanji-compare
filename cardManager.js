import * as KanjiManager from "./kanjiManager.js";
import * as KanjiDictionary from "./kanjiDictionary.js";

const cardTemplate = document.getElementById("kanji-card-template");
const cardHolder = document.getElementById("kanji-container");

const addCardButton = document.getElementById("add-button");
const removeCardButton = document.getElementById("remove-button");

const defaultKanji = ["日", "月", "人", "入", "水", "氷"];
//const defaultKanji = ["鉄", "仙", "失", "金", "繰", "儿"];

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
        let cardDelete = card.getElementsByClassName("card-delete")[0];

        // Configure the card
        //card.id = "kanji-" + cardNumber;
        card.setAttribute("data-slot", cardNumber);

        cardInput.value = defaultKanji[cardNumber];

        cardInput.addEventListener("input", (event) => updateCard(event.target.parentNode));

        cardDelete.addEventListener("click", (event) => removeCard(card));

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

        removedCard.remove();

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

function createTag(text, deletable, ...classes)
{
    let tag = document.createElement("span");

    tag.innerHTML = text;
    tag.classList.add("data-tag");

    for (let i = 0; i < classes.length; i++)
    {
        tag.classList.add(classes[i]);
    }

    // Add Delete Button

    if (deletable)
    {
        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = "remove";

        deleteButton.classList.add("material-icons");
        deleteButton.classList.add("tag-remove-button");

        deleteButton.addEventListener("click", (evt) => deleteTag(tag));

        tag.appendChild(deleteButton);
    }

    return tag;
}

function deleteTag(tag)
{
    tag.remove();
}

export async function populateCardData(slot, data)
{
    let card = getCard(slot);

    let meaningsSection = card.getElementsByClassName("meanings")[0];
    let onReadingsSection = card.getElementsByClassName("on-readings")[0];
    let kunReadingsSection = card.getElementsByClassName("kun-readings")[0];

    let partsSection = card.getElementsByClassName("parts")[0];

    for (const meaning of data.meanings)
    {
        let meaningTag = createTag(meaning, true, "meaning-tag");
        
        meaningsSection.appendChild(meaningTag);
    }

    for (const part of data.parts)
    {
        let partTag = document.createElement("button");
        partTag.classList.add("data-tag");
        partTag.classList.add("part-tag");
        partTag.innerHTML = part;

        let strokes = card.getElementsByClassName("strokes")[0];
        let eGroups = strokes.getElementsByTagName("g");

        let groupFound = false;

        for (const group of eGroups)
        {
            let groupElement = group.getAttribute("kvg:element");
            let groupOriginal = group.getAttribute("kvg:original");

            if (groupElement == null)
            {
                continue;
            }

            if (await KanjiDictionary.compareParts(groupElement, part))
            {
                partTag.addEventListener("click", (evt) => togglePartToggle(partTag, group));
                groupFound = true;
            }

            else if (await KanjiDictionary.compareParts(groupOriginal, part))
            {
                partTag.addEventListener("click", (evt) => togglePartToggle(partTag, group));
                groupFound = true;
            }

        }

        if (!groupFound)
        {   
            partTag.classList.add("deactivated-part-tag");
        }

        partsSection.appendChild(partTag);
    }

    for (const reading of data.readings.on)
    {
        let readingTag = createTag(reading, true, "reading-tag", "on-reading-tag");

        onReadingsSection.appendChild(readingTag);
    }

    for (const reading of data.readings.kun)
    {
        let readingTag = createTag(reading, true, "reading-tag", "kun-reading-tag");

        kunReadingsSection.appendChild(readingTag);
    }

}

// Removes the strokes, meanings, readings, etc from a card
function clearCard(card)
{
    card.getElementsByClassName("strokes")[0].innerHTML = "";
    card.getElementsByClassName("parts")[0].innerHTML = "";
    card.getElementsByClassName("meanings")[0].innerHTML = "";
    card.getElementsByClassName("on-readings")[0].innerHTML = "";
    card.getElementsByClassName("kun-readings")[0].innerHTML = "";
}

function togglePartToggle(partTag, elementGroup)
{
    partTag.classList.toggle("highlighted");
    elementGroup.classList.toggle("highlighted");
}

export function getCard(slot)
{
    return cards[slot];
}

init();