import { names } from "./nameTranslationData.js"

const container = document.querySelector('#autocomplete-container');
const autocomplete = container.querySelector('#autocomplete');
const mainInput = container.querySelector('#main-input');

let outputContainer = document.querySelector("#found-pokemon-container");
let presetContainer = document.querySelector("#preset-container");
let resultContainer = document.querySelector("#result-container");

//Filter für deutscheSprachauswahl
function getNames(language_id) {
    return names.filter(pokemon => (pokemon.local_language_id == language_id || pokemon.local_language_id == 9))
}
let getGermanNames = getNames(6)

// Suche Pokemon
function findPokemon(query){
    let foundObj = {};
    let result = getGermanNames.filter(pokemon => {
        return pokemon.name.toLowerCase().startsWith(query.toLowerCase())
    });
    if (result[0] !== undefined && query.at(0) !== undefined) {
                foundObj.name = query+result[0].name.toLowerCase().substring(query.length);
                foundObj.id = result[0].pokemon_species_id;
            return foundObj
    } else {
        foundObj.name = "";
        foundObj.id = undefined
        return foundObj;
    }
}

//EventListener für das Suchfeld, das soweit einzige Input
mainInput.addEventListener('keyup', onKeyUp);

function onKeyUp(e) {
    e.preventDefault();

    let foundPokemon = findPokemon(mainInput.value);
    autocomplete.textContent = foundPokemon.name;

    if (mainInput.value === '') {
  	    autocomplete.textContent = '';
        return;
    }
    if (keyChecker(e, 'Enter') || keyChecker(e, 'ArrowRight') ) {
	    mainInput.value = foundPokemon.name;
        autocomplete.textContent = '';
    }

    if (foundPokemon.id !== undefined) {
        let pokemonId = `${foundPokemon.id}`

        setTimeout(() => {
            renderCard(pokemonId);
        }, "600")

    }
}

function keyChecker(e, key) {
	const keys = {
        'ArrowRight':37,
        'Enter':13,
        'ArrowLeft':39
    }
    if (e.keyCode === keys[key] || e.which === keys[key] || e.key === key) return true;
    return false;
}

const fetchData = async (inquiry) => {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${inquiry}`)
    let data = await response.json();
    return data;
}

function getGermanNameById(id) {
    let translatedName = "";
    getGermanNames.forEach(elem => {
        if (elem.pokemon_species_id === id && elem.local_language_id == 6) {
            translatedName = elem.name;
        }
    });
    return translatedName;
}

async function renderCard(id) {
    outputContainer.replaceChildren();

    //Alle Daten des Pokemon aus der API 
    let pokemonData = await fetchData(id);
//! --------found-pokemon-container---------
    //Foto-Element
    let image = document.createElement("img");
    image.id = "current-picture"
    image.src = pokemonData.sprites.front_default;
    outputContainer.appendChild(image);

    //Feld für Namens-Ausgabe
    let nameContainer = document.createElement("div");
    nameContainer.id = "name-container"
    nameContainer.innerText = `${firstCharToUpperCase(pokemonData.name)} \n ${firstCharToUpperCase(getGermanNameById(id))}`
    outputContainer.appendChild(nameContainer)

    // Der Typ oder die Typen des Pokemons
    let typeContainer = document.createElement("div");
    let types = pokemonData.types;

    let firstType = types[0].type;
    let firstTypeContainer = document.createElement("div");
    firstTypeContainer.classList.add("own-type-container")
    firstTypeContainer.style.backgroundColor = getTypeColor(firstType.name)
    firstTypeContainer.textContent = firstType.name;
    typeContainer.appendChild(firstTypeContainer);

    //Prüfung ob Pokemon zweiten Typen besitzt
    let secondType = null;
    if (types.length === 2) {
        secondType = types[1].type
        let secondTypeContainer = document.createElement("div");
        secondTypeContainer.classList.add("own-type-container")
        secondTypeContainer.style.backgroundColor = getTypeColor(secondType.name)
        secondTypeContainer.textContent = secondType.name;
        typeContainer.appendChild(secondTypeContainer);
    }
    outputContainer.appendChild(typeContainer);

    //Preset-BTN - Zwischenspeicher der ID als Value
    let elAddPresetBtn = document.createElement("button");
    elAddPresetBtn.id = "add-preset-btn";
    elAddPresetBtn.textContent = "+";
    outputContainer.appendChild(elAddPresetBtn);

    elAddPresetBtn.addEventListener("click", () => {
        //!----------preset-container----------------
        //Preset - Button mit Foto als Inhalt und ID als Value  
        let presetImageBtnContainer = document.createElement("button");
        presetImageBtnContainer.classList.add("preset-image-btn");
        presetImageBtnContainer.value = id;

        let presetImage = document.createElement("img");
        presetImage.src = pokemonData.sprites.front_default;
        presetImageBtnContainer.appendChild(presetImage);

        //Bei Click auf Preset - Button wird neu gerendert
        presetImageBtnContainer.addEventListener("click", (evt) => {
            renderCard(evt.currentTarget.value)
        });
        presetContainer.appendChild(presetImageBtnContainer);
    });

    //!----------------result-container---------------------------
    // Objekt aller Typen als String(Key) und deren Schadensrate(Value)
    let typeEffectiveness = await getDamageRelations(firstType, secondType);
    // Entferne Typen mit Standard-Effektivität von 1 
    let relevantEffectiveness = deleteAveragedEffectiveness(typeEffectiveness);
    // Fasse Typen mit gleichen Schadenswerten in einer Map zusammen
    let myMap = separateRelevantEffectiveness(relevantEffectiveness);
    // Sortiere Map nach Höchster Effektivität absteigend
    let sortedMap = new Map([...myMap.entries()].sort().reverse());

    resultContainer.replaceChildren();

    //Teile auf in: Fügt erhöhten und verringerten Schaden hinzu
    let effectively = document.createElement("div");
    effectively.style.backgroundColor = "green";
    effectively.classList.add("do-dont-do-container");
    
    let notEffectively = document.createElement("div");
    notEffectively.classList.add("do-dont-do-container");
    notEffectively.style.backgroundColor = "red";

    sortedMap.forEach((value, key) => {

        let elDamageRatioContainer = document.createElement("div");
        elDamageRatioContainer.classList.add("damage-ratio");

        let heading = document.createElement("h4");
        heading.classList.add("damage-ratio-heading")
        heading.textContent = `  ${key} x damage`;
        elDamageRatioContainer.appendChild(heading)

        value.forEach(type => {
            let elTypeContainer = document.createElement("div");
            elTypeContainer.classList.add("type-container");
            elTypeContainer.style.backgroundColor = getTypeColor(type);
            elTypeContainer.textContent = firstCharToUpperCase(type);

            elDamageRatioContainer.appendChild(elTypeContainer)
        });
        if (key > 1) {
            effectively.appendChild(elDamageRatioContainer)
        } else {
            notEffectively.appendChild(elDamageRatioContainer)
        }
        resultContainer.append(effectively);
        resultContainer.append(notEffectively);
      });
}

// Kampf-Typ(Key) - dazugehörige Farbe (Value) 
function getTypeColor(type) {
    let typeColor = {
        normal: "#A9AA79",
        //orginal
        fire: "#FF9D51",
        water: "#6891F0",
        grass: "#79C94F",
        flying: "#A991F0",
        fighting: "#C12C23",
        poison: "#A13EA1",
        electric: "#F8D12C",
        ground: "#E1C168",
        rock: "#B9A135",
        psychic: "#F85789",
        ice: "#AACCFF",
        bug: "#a9b91a",
        ghost: "#715799",
        steel: "#B9B9D1",
        dragon: "#7135F8",
        dark: "#715746",
        fairy: "#FA00C0"
    }
    return typeColor[type];
}

// Fasse Typen mit gleichen Schadenswerten in einer Map zusammen
function separateRelevantEffectiveness(input) {
    let relevantEffectiveness = input;
    let myMap = new Map();
    for (const [type, damageRatio] of Object.entries(relevantEffectiveness)) {
        if (myMap.has(damageRatio)) {
            let typeArray = myMap.get(damageRatio)
            typeArray.push(type);
        } else {
            let typeArray = [type]
            myMap.set(damageRatio, typeArray);
        }
      }
      return myMap
}

// Entferne Typen mit Standard-Effektivität von 1 
function deleteAveragedEffectiveness(input){
    let typeEffectiveness = input;
    for (let value in typeEffectiveness) {
        if (typeEffectiveness[value] === 1) {
            delete typeEffectiveness[value]
        }
    }
    return typeEffectiveness;
}

// Erster Buchstabe des Wortes wird groß
function firstCharToUpperCase(word) {
    return word.at(0).toUpperCase()+word.substring(1).toLowerCase();
}

// Objekt aller Typen als String(Key) und deren Schadensrate(Value)
async function getDamageRelations(firstType, secondType) {
    let typeEffectiveness = {
        normal: 1,
        fire: 1,
        water: 1,
        grass: 1,
        flying: 1,
        fighting: 1,
        poison: 1,
        electric: 1,
        ground: 1,
        rock: 1,
        psychic: 1,
        ice: 1,
        bug: 1,
        ghost: 1,
        steel: 1,
        dragon: 1,
        dark: 1,
        fairy: 1
    }

    if (secondType !== null) {
        const [firstTypeRelations, secondTypeRelations] = await Promise.all([
            fetch(firstType.url).then(relations => relations.json()), fetch(secondType.url).then(relations => relations.json())
        ])
        console.log(firstTypeRelations, secondTypeRelations);
    }

    let response = await fetch(firstType.url);
    let data = await response.json();
    let relations = data.damage_relations
    relations.double_damage_from.forEach(elem => {
        typeEffectiveness[elem.name] *= 2 
    })
    relations.half_damage_from.forEach(elem => {
        typeEffectiveness[elem.name] *= 0.5
    })
    relations.no_damage_from.forEach(elem => {
        typeEffectiveness[elem.name] *= 0 
    })
    if (secondType !== null) {
        let response = await fetch(secondType.url);
        let data = await response.json();
        let relations = data.damage_relations
        relations.double_damage_from.forEach(elem => {
            typeEffectiveness[elem.name] *= 2 
        })
        relations.half_damage_from.forEach(elem => {
            typeEffectiveness[elem.name] *= 0.5
        })
        relations.no_damage_from.forEach(elem => {
            typeEffectiveness[elem.name] *= 0 
        })
    }
    return typeEffectiveness
}
