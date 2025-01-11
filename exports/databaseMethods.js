const mongoose = require('mongoose');
const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME } = require('../config.json')
const { Challenge, ChallengeParticipation, Player, FlagsObtained, Flag } = require('./challengeSchemas.js')

const uri = `mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@challenge.g4x9t.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority&appName=challenge`;

async function registerUser(discordID, name, registrationDate) {
    mongoose.connect(uri);

    const existingPlayer = await Player.findById(discordID);
    if (!existingPlayer) {
        const player = new Player({ _id: discordID, name: name, registrationDate: registrationDate });
        await player.save();
        return `Registration complete! Your display name is ${name}.`;
    } else {
        throw new Error("Player already exists");
    }
}

async function joinChallenge(challengeID, discordID) {
    mongoose.connect(uri);

    const existingPlayer = await ChallengeParticipation.find({ challengeID: challengeID, playerID: discordID })
    if (!existingPlayer) {
        const challengeParticipation = new ChallengeParticipation({ challengeID: challengeID, playerID: discordID });
        await challengeParticipation.save();
        return "Entry added successfully";
    } else {
        throw new Error("Player has already joined the specified challenge");
    }
}

async function checkFlag(flagString, challengeID, discordID) {
    mongoose.connect(uri);

    const flag = await Flag.find().byFlag(flagString);
    if (!flag) {
        return "Wrong flag"
    }

    // NOTE: MAKE CHANGES DEPENDING ON WHETHER A SCOREBOARD COLLECTION SHOULD BE MADE

    const flagUniqueID = flag.getUniqueID()
    const existingSubmission = await FlagsObtained.find().byUniqueID(flagUniqueID);

    if (!existingSubmission) {
        const flagSubmission = new FlagsObtained({ challengeID: challengeID, playerID: discordID, flagID: flag.flagID });
        await flagSubmission.save();
    } else {
        return "Flag has been submitted before"
    }
}

module.exports = {
    registerUser,
    joinChallenge,
    checkFlag
}