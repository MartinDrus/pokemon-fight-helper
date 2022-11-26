import { names } from "./nameTranslationData.js"

const container = document.querySelector('#autocomplete-container');
const autocomplete = container.querySelector('#autocomplete');
const mainInput = container.querySelector('#main-input');

let outputContainer = document.querySelector("#found-pokemon-container")

function getNames(language_id) {
    return names.filter(pokemon => (pokemon.local_language_id == language_id || pokemon.local_language_id == 9))
}

let getGermanNames = getNames(6)

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
        let pokemonId = `pokemon/${foundPokemon.id}`

        renderCard(pokemonId);
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




// function fetchData(inquiry) {

//     let pokemonInformation = null;

//     fetch(`https://pokeapi.co/api/v2/${inquiry}`)
//     .then((response) => response.json())
//     .then((data) => {
//         pokemonInformation = data;
//         console.log(pokemonInformation);
//         return pokemonInformation;
//     })
//     .catch(error => console.log(error));

// }

const fetchData = async (inquiry) => {
    let response = await fetch(`https://pokeapi.co/api/v2/${inquiry}`)
    let data = await response.json();
    return data;
}




async function renderCard(id) {
    outputContainer.replaceChildren();

    let pokemonData = await fetchData(id);

    let image = document.createElement("img");
    image.src = pokemonData.sprites.front_default;

    outputContainer.appendChild(image);

    let types = pokemonData.types;
    let firstType = types[0].type
    let secondType = null;
    if (types.length === 2) {
        secondType = types[1].type
    }


    let typeEffectiveness = await getDamageRelations(firstType, secondType);
    let relevantEffectiveness = deleteAveragedEffectiveness(typeEffectiveness);

    console.log(relevantEffectiveness);



}

function deleteAveragedEffectiveness(input){
    let typeEffectiveness = input;
    for (let key in typeEffectiveness) {
        if (typeEffectiveness[key] === 1) {
            delete typeEffectiveness[key]
        }
    }
    return typeEffectiveness;
}

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
    let response = await fetch(firstType.url)
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
        let response = await fetch(secondType.url)
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
