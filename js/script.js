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

    getDamageRelations(pokemonData);

    // let types = await getDamageRelations(pokemonData)


    //console.log("renderCard types  ", types);



    

}


async function getDamageRelations(pokemonData) {

    let typeEffectiveness = {
        normal: 0,
        fire: 0,
        water: 0,
        grass: 0,
        flying: 0,
        fighting: 0,
        poison: 0,
        electric: 0,
        ground: 0,
        rock: 0,
        psychic: 0,
        ice: 0,
        bug: 0,
        ghost: 0,
        steel: 0,
        dragon: 0,
        dark: 0,
        fairy: 0

    }

    let typeArray = await pokemonData.types

    let damageObj = {}


    typeArray.forEach(async entry => {
        let pokemonType = `type/${entry.type.name}`;
        let damageStats = await fetchData(pokemonType);

        console.log(damageStats.damage_relations.double_damage_from);

        damageObj.doubleDamage = damageStats.damage_relations.double_damage_from;
        damageObj.halfDamage = damageStats.damage_relations.half_damage_from;
        damageObj.noDamage = damageStats.damage_relations.no_damage_from;


    });

    console.log(damageObj);


    //calculateDamage(types);

    
}


async function calculateDamage(types) {



    let test = await types;


    console.log(test);

    // (async () => {
    //     for await (const num of types) {
    //       console.log(num);
    //     }
    // })();
    // for (let i = 0; i < array.length; i++) {
    //     const element = array[i];
        
    // }



}

