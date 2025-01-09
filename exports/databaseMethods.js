const mongoose = require('mongoose');
const { DATABASE_USERNAME, DATABASE_PASSWORD } = require('../config.json')
const { Challenge, ChallengeParticipation, Player, FlagsObtained, Flag } = require('./challengeSchemas.js')

const uri = `mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@challenge.g4x9t.mongodb.net/?retryWrites=true&w=majority&appName=challenge`;

async function registerUser(discordID, name, registrationDate) {
    mongoose.connect(uri);

    const existingPlayer = await Player.findById(discordID);
    if (!existingPlayer) {
        const player = new Player({ _id: discordID, name: name, registrationDate: registrationDate });
        await player.save();
        return "Player added successfully"
    } else {
        return "Player already exists"
    }
}



module.exports = {
    registerUser,
}