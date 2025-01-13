const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organiser: { type: String, required: true }, // user ID of organiser to allow for them to modify the challenge
    startDate: { type: Date, required: true }, // stored in UTC (-0000)
    duration: { type: Number, required: true }, // in seconds
    isHiddenID: { type: Boolean, required: true },
    longAnsChannelID: { type: String || null, required: true },
    dateCreated: { type: Date, required: true }
}, { collection: 'challenges' });

const challengeParticipationSchema = new mongoose.Schema({
    challengeID: { type: String, required: true },
    playerID: { type: String, required: true }
}, { 
    collection: 'challengeParticipation',
    query: {
        byChallengeID(challengeID) {
            return this.where({ challengeID: challengeID });
        },
        byPlayerID(playerID) {
            return this.where({ playerID: playerID });
        }
    } });

const playerSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    registrationDate: { type: String, required: true }
}, { collection: 'players' });

const flagsObtainedSchema = new mongoose.Schema({
    playerID: { type: String, required: true },
    challengeID: { type: String, required: true },
    flagID: { type: String, required: true }
}, { 
    collection: 'flagsObtained',
    query: {
        byUniqueID(uniqueID) {
            const [challengeID, flagID] = uniqueID.split('_');
            return this.where({ challengeID: challengeID, flagID: flagID });
        },
        byPlayerID(playerID) {
            return this.where({ playerID: playerID });
        }
    }
 });

const flagSchema = new mongoose.Schema({
    challengeID: { type: String, required: true },
    flagID: { type: String, required: true },
    flag: { type: String, required: true },
    flagTitle: { type: String, required: true }, // question title
    flagInfo: { type: String, required: true }, // question information
    isLongAns: { type: Boolean, required: false }, // long answer format (Challenge.longAnsChannelID? takes precedence!)
    value: { type: Number, required: true }
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

flagSchema.methods.getUniqueID = function getUniqueID() {
    const uniqueID = this.challengeID + '_' + this.flagID;
    return uniqueID
};

const scoreboardSchema = new mongoose.Schema({
    challengeID: { type: String, required: true },
    playerID: { type: String, required: true },
    scoreValue: { type: Number, required: true }
}, {
    collection: 'scoreboard',
    query: {
        byUniqueID(uniqueID) {
            const [challengeID, playerID] = uniqueID.split('_');
            return this.where({ challengeID: challengeID, playerID: playerID });
        }
    }
});

scoreboardSchema.methods.getUniqueID = function getUniqueID() {
    const uniqueID = this.challengeID + '_' + this.playerID;
    return uniqueID
}

const Challenge = mongoose.model('Challenge', challengeSchema);
const ChallengeParticipation = mongoose.model('challengeParticipation', challengeParticipationSchema);
const Player = mongoose.model('Player', playerSchema);
const FlagsObtained = mongoose.model('FlagsObtained', flagsObtainedSchema);
const Flag = mongoose.model('Flag', flagSchema);
const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);

module.exports = {
    Challenge: Challenge,
    ChallengeParticipation: ChallengeParticipation,
    Player: Player,
    FlagsObtained: FlagsObtained,
    Flag: Flag, 
    Scoreboard: Scoreboard
}