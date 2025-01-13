const mongoose = require('mongoose');
const assert = require('assert');
const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME } = require('../config.json')
const { Challenge, ChallengeParticipation, Player, FlagsObtained, Flag } = require('./challengeSchemas.js')

const uri = `mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@challenge.g4x9t.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority&appName=challenge`;

async function registerUser(discordID, name, registrationDate) {
    await mongoose.connect(uri);

    const existingPlayer = await Player.findById(discordID);
    if (existingPlayer.length == 0) {
        const player = new Player({ _id: discordID, name: name, registrationDate: registrationDate });
        await player.save();
        return `Registration complete! Your display name is ${name}.`;
    } else {
        throw new Error("Player already exists.");
    }
}

async function joinChallenge(challengeID, discordID) {
    await mongoose.connect(uri);

    const existingPlayer = await ChallengeParticipation.find({ challengeID: challengeID, playerID: discordID })
    if (existingPlayer.length == 0) {
        const challengeParticipation = new ChallengeParticipation({ challengeID: challengeID, playerID: discordID });
        await challengeParticipation.save();
        return "Entry added successfully";
    } else {
        throw new Error("Player has already joined the specified challenge.");
    }
}

/** 
 * Creates a challenge. All inputs should be String -- parsing is done within the function.
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
        const challenge = new Challenge({ name: name, organiser: organiser, startDate: inputStartDate, duration: inputDuration, isHiddenID: true, longAnsChannelID: longAnsChannelID, dateCreated: dateCreated });

        // While name is not the primary key, we want to avoid duplicate names for challenges to avoid confusion
        const existingChallenge = await Challenge.find({ name: name });
        if (existingChallenge.length > 0) {
            return "A challenge with the same name already exists.";
        } else {
            await challenge.save();
            return "Challenge created successfully. Use the `display` option to check the details."
        }
    } catch (err) {
        return "Input not of correct format."
    }    
}

async function checkFlag(flagString, challengeID, discordID) {
    await mongoose.connect(uri);

    const flag = await Flag.find().byFlag(flagString);
    if (!flag) {
        return "Wrong flag"
    }

    // NOTE: MAKE CHANGES DEPENDING ON WHETHER A SCOREBOARD COLLECTION SHOULD BE MADE

    const flagUniqueID = flag.getUniqueID()
    const existingSubmission = await FlagsObtained.find().byUniqueID(flagUniqueID);

    if (existingSubmission.length == 0) {
        const flagSubmission = new FlagsObtained({ challengeID: challengeID, playerID: discordID, flagID: flag.flagID });
        await flagSubmission.save();
    } else {
        return "Flag has been submitted before"
    }
}

module.exports = {
    registerUser,
    joinChallenge,
    createChallenge,
    checkFlag
}