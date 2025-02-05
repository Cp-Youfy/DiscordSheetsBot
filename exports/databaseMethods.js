const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { inlineCode } = require('discord.js');
const assert = require('assert');
const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DEFAULT_CHANNEL_LOG_ID } = require('../config.json');
const { Challenge, ChallengeParticipation, Player, FlagsObtained, Flag, Scoreboard } = require('./challengeSchemas.js');

const uri = `mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@challenge.g4x9t.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority&appName=challenge`;

/**
 * 
 * @param {String} discordID 
 * @param {String} name 
 * @param {Date} registrationDate 
 * @returns 
 */
async function registerUser(discordID, name, registrationDate) {
    await mongoose.connect(uri);

    const existingPlayer = await Player.findById(discordID);
    if (existingPlayer.length == 0) {
        const dateCreated = new Date();
        const player = new Player({ id: discordID, name: name, registrationDate: registrationDate, dateCreated: dateCreated });
        await player.save();
        return `Registration complete! Your display name is ${name}.`;
    } else {
        throw new Error("Player already exists.");
    }
}

/**
 * 
 * @param {String} flag 
 * @param {String} flagTitle 
 * @param {String} flagInfo 
 * @param {Number} value 
 * @param {Boolean} isLongAns 
 */
async function createFlag(challengeID, flag, flagTitle, flagInfo, value, isLongAns) { 
    await mongoose.connect(uri);
    const dateCreated = new Date();

    // checks if the flag specified is already used
    const existingFlag = await Flag.find({ challengeID: challengeID, flag: flag });
    if (existingFlag.length != 0) {
        return "Flag is already used in the challenge.";
    } else {
        const newFlag = new Flag({ challengeID: challengeID, flag: flag, flagTitle: flagTitle, flagInfo: flagInfo, value: value, isLongAns: isLongAns, dateCreated: dateCreated });
        await newFlag.save();
        return "Flag added successfully.";
    }
}

/**
 * 
 * @param {String} challengeID 
 * @param {String} discordID 
 * @returns 
 */
async function joinChallenge(challengeID, discordID) {
    await mongoose.connect(uri);

    const dateCreated = new Date();
    const existingPlayer = await ChallengeParticipation.find({ challengeID: challengeID, playerID: discordID });
    const challenge = await findChallenge(challengeID) // throws error if not found
    const isOpen = await challenge.isOpen
    if (existingPlayer.length != 0) {
        throw new Error("Player has already joined the specified challenge.");
    } else if (!isOpen) {
        throw new Error("The specified challenge is not currently open.")
    } else {
        const challengeParticipation = new ChallengeParticipation({ challengeID: challengeID, playerID: discordID, dateCreated: dateCreated });
        await challengeParticipation.save();
        const scoreboardEntry = new Scoreboard({ challengeID: challengeID, playerID: discordID, scoreValue: 0, dateCreated: dateCreated });
        await scoreboardEntry.save();
        return "Entry added successfully";
    }
}

/**
 * Creates a challenge. All inputs should be String -- parsing is done within the function.
 * @param {String} name 
 * @param {String} organiser 
 * @param {Date} startDate 
 * @param {Number} duration 
 * @param {[String, null]} longAnsChannelID 
 * @returns 
 */
async function createChallenge(name, organiser, startDate, duration, longAnsChannelID) {
    // Parse startDate into a Date object first
    try {
        assert(startDate.length == 19);
        const inputStartDate = new Date(startDate);
        const inputDuration = Number(duration);
        const dateCreated = new Date();
        await mongoose.connect(uri);
        // isHiddenID will be default set to true and can be changed with the modify command
        // it is not in the modal due to the numFields <= 5 Discord API restriction
        const challenge = new Challenge({ name: name, organiser: organiser, startDate: inputStartDate, duration: inputDuration, isHiddenID: true, longAnsChannelID: longAnsChannelID, isOpen: false, dateCreated: dateCreated, logChannelID: DEFAULT_CHANNEL_LOG_ID });

        // While name is not the primary key, we want to avoid duplicate names for challenges to avoid confusion
        const existingChallenge = await Challenge.find({ name: name });
        if (existingChallenge.length > 0) {
            return "A challenge with the same name already exists.";
        } else {
            await challenge.save();
            return `Challenge ${name} created successfully. Use the ${inlineCode(display)} option to check the details.`
        }
    } catch (err) {
        return "Input not of correct format."
    }    
}

/**
 * Checks for the validity of a flag; if correct, updates Scoreboard and FlagsObtained accordingly
 * @param {String} flagString 
 * @param {String} challengeID 
 * @param {String} discordID 
 * @returns 
 */
async function checkFlag(flagString, challengeID, discordID) {
    await mongoose.connect(uri);

    const existingPlayer = await ChallengeParticipation.find({ challengeID: challengeID, playerID: discordID });
    if (existingPlayer.length == 0) {
        const challengeIdAsObjectId = new ObjectId(challengeID)
        const existingChallenge = await Challenge.findById(challengeIdAsObjectId)
        if (existingChallenge.length == 0) {
            throw new Error("Challenge does not exist: Is your challenge ID correct?")
        } else {
            throw new Error(`You have not joined the challenge. Use ${inlineCode('/challenge join') + inlineCode(challengeID)} to join the challenge first.`);
        }
    }

    const flag = await Flag.find({ challengeID: challengeID, flag: flagString });
    if (flag.length == 0) {
        return "Wrong flag";
    }

    const flagUniqueID = flag.getUniqueID()
    const existingSubmission = await FlagsObtained.find().byUniqueID(flagUniqueID);
    const dateCreated = new Date();

    if (existingSubmission.length == 0) {
        const flagSubmission = new FlagsObtained({ challengeID: challengeID, playerID: discordID, flagID: flag.flagID, dateCreated: dateCreated });
        await flagSubmission.save();
    } else {
        return "Flag has been submitted before"
    }

    const scoreboardUpdateRes = await Scoreboard.findOneAndUpdate({ challengeID: challengeID, playerID: discordID }, { scoreValue: scoreValue + flag.value });

    if (scoreboardUpdateRes.length == 0) {
        // default error handling
        throw new Error("Scoreboard update unsuccessful: No scoreboard entry found.");
    }

    return `Flag submission successful! You have gained ${flag.value} points.`
}

/**
 * Looks up the challenge from MongoDB by its name or id and returns it as a mongoose.Document object.
 * If not found, throw an error (for response via error handling)
 * @param {String} param Challenge name or ID (if known) -- Case-sensitive
 */
async function findChallenge(param) {
    await mongoose.connect(uri);
    // first search by id
    try {
        const paramAsObjectId = new ObjectId(param);
        const challengeById = await Challenge.findById(paramAsObjectId);
        const multipleChallengesErrMsg = "Unexpected behaviour: Multiple challenges found (findChallenge)."

        // if not found by id, try name
        if (challengeById.length == 0) {
            const challenge = await Challenge.find({ name: param });
            if (challenge.length == 0) {
                throw new Error("Challenge not found")
            } else if (challenge.length > 1) {
                throw new Error(multipleChallengesErrMsg)
            } else {
                return challenge[0]
            }
        } else if (challengeById.length > 1) {
            throw new Error(multipleChallengesErrMsg)
        } else {
            // 0th index not required -- recall id is unique so findById returns only one document
            return challengeById
        }
    } catch (err) {
        // id string is not even valid
        const challenge = await Challenge.find({ name: param });
        if (challenge.length == 0) {
            throw new Error("Challenge not found.")
        } else if (challenge.length > 1) {
            throw new Error(multipleChallengesErrMsg)
        } else {
            return challenge[0]
        }
    }    
}

module.exports = {
    registerUser,
    joinChallenge,
    createChallenge,
    checkFlag,
    findChallenge,
    createFlag
}