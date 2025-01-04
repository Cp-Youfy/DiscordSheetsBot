const { SHEETS_API_LINK } = require('../config.json');
const axios = require('axios');
const assert = require('assert');
const Chance = require('chance');
const fs = require("fs");
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const CACHED_SHEET = 'exports/sheetsData.json'
const chance = new Chance();

function addEntry(wordStr, definitionStr) {
    try {
        assert(wordStr.length <= 32);
        assert(definitionStr.length <= 200);
    }

    catch (exception) {
        return `Parameters not of proper format!`;
    }

    axios.post(SHEETS_API_LINK, {
        data: {
            word: wordStr,
            definition: definitionStr
        }
    }
    )

    return `Entry added to spreadsheet.`;
}

async function getJson() {
    const res = await axios.get(SHEETS_API_LINK)
        .then((response) => response.data)
    return res
}

async function cacheJson() {
    // cache results locally to reduce number of API calls
    const res = await getJson()
    
    try {
        await writeFile(CACHED_SHEET, JSON.stringify(res));
        return 'Sheets data cached successfully';
    } catch (error) {
        return error;
    }
}

/**
 * Returns n entries from the cached data
 * @param {Number} n Number of (distinct) entries to be returned
 * @return {Array | String} Array of n entries or error string
 */
async function getEntry(n) {
    const data = await readFile(CACHED_SHEET)
        .then((rawData) => JSON.parse(rawData, function(k, v) {
            // renaming for discord embed
            if (k === "word") {
                this.name = v;
                return; // if return undefined, orignal property will be removed
            }
            if (k === "definition") {
                this.value = v;
                return;
            }
            return v;
        }));

    const dataLen = data.length;

    try {
        assert(0 <= n && n <= dataLen);
    }
    catch (exception) {
        throw exception
    }

    const resultArr = []
    
    const uniques = chance.unique(chance.natural, n, {min: 0, max: (dataLen - 1)});

    for (var i = 0; i < uniques.length; i++) {
        resultArr.push(data[uniques[i]])
    }

    return resultArr
}

module.exports = {
    addEntry,
    getJson,
    cacheJson,
    getEntry
};