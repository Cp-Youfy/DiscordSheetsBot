const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organiser: { type: String, required: true }, // user ID of organiser to allow for them to modify the challenge
    startDate: { type: Date, required: true }, // stored in UTC (-0000)
    duration: { type: Number, required: true }, // in seconds
    isHiddenID: { type: Boolean, required: true },
    longAnsChannelID: { type: String || null, required: true },
    isOpen: { type: Boolean, required: true }, // whether the competition can be joined; default to false
    dateCreated: { type: Date, required: true },
    logChannelID: {type: String || null, required: true}
}, { collection: 'challenges',
    query: {
        challengeNameToID(challengeName) {
            return this.id.where({ challengeName: challengeName })
        }
    }
});

const playerSchema = new mongoose.Schema({
    id: { type: String, required: true }, // String, not ObjectId
    name: { type: String, required: true },
    registrationDate: { type: String, required: true },
    dateCreated: { type: Date, required: true }
}, { collection: 'players' });

const flagsObtainedSchema = new mongoose.Schema({
    playerID: { type: String, required: true },
    challengeID: { type: String, required: true },
    flag: { type: String, required: true },
    dateCreated: { type: Date, required: true }
}, { 
    collection: 'flagsObtained',
    query: {
        byPlayerID(playerID) {
            return this.where({ playerID: playerID });
        }
    }
 });

const flagSchema = new mongoose.Schema({
    challengeID: { type: String, required: true },
    flag: { type: String, required: true },
    flagTitle: { type: String, required: true }, // question title
    flagInfo: { type: String, required: true }, // question information
    isLongAns: { type: Boolean, required: false }, // long answer format (Challenge.longAnsChannelID? takes precedence!)
    value: { type: Number, required: true },
    dateCreated: { type: Date, required: true }
}, { 
    collection: 'flags',
    query: {
        byValue(value) {
            return this.where({ value: value });
        },
        byChallengeID(challengeID) {
            return this.where({ challengeID: challengeID });
        },
        byFlag(flag) {
            return this.where({ flag: flag });
        },
        byTitle(flagTitle) {
            return this.where({ flagTitle: flagTitle })
        },
    } });

const scoreboardSchema = new mongoose.Schema({
    challengeID: { type: String, required: true },
    playerID: { type: String, required: true },
    scoreValue: { type: Number, required: true },
    dateCreated: { type: Date, required: true }
}, {
    collection: 'scoreboard',
});

const Challenge = mongoose.model('Challenge', challengeSchema);
const Player = mongoose.model('Player', playerSchema);
const FlagsObtained = mongoose.model('FlagsObtained', flagsObtainedSchema);
const Flag = mongoose.model('Flag', flagSchema);
const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);

module.exports = {
    Challenge: Challenge,
    Player: Player,
    FlagsObtained: FlagsObtained,
    Flag: Flag, 
    Scoreboard: Scoreboard
}