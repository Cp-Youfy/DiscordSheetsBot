const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    name: String,
    organiser: String,
    startDate: Date,
    duration: Number, // in seconds
    isHiddenID: Boolean,
    longAnsChannelID: String || null
}, { collection: 'challenges' });

const challengeParticipationSchema = new mongoose.Schema({
    challengeID: String,
    playerID: String
}, { 
    collection: 'challengeParticipation',
    query: {
        byChallengeID(challengeID) {
            return this.where({ challengeID: challengeID })
        },
        byPlayerID(playerID) {
            return this.where({ playerID: playerID })
        }
    } });

const playerSchema = new mongoose.Schema({
    _id: String,
    name: String,
    registrationDate: String
}, { collection: 'players' });

const flagsObtainedSchema = new mongoose.Schema({
    playerID: String,
    challengeID: String,
    flagID: String
}, { 
    collection: 'flagsObtained',
    query: {
        byUniqueID(uniqueID) {
            const [challengeID, flagID] = uniqueID.split('_');
            return this.where({ challengeID: challengeID, flagID: flagID })
        },
        byPlayerID(playerID) {
            return this.where({ playerID: playerID })
        }
    }
 });

const flagSchema = new mongoose.Schema({
    challengeID: String,
    flagID: String,
    flag: String,
    value: Number
}, { 
    collection: 'flags',
    query: {
        byValue(value) {
            return this.where({ value: value })
        },
        byChallengeID(challengeID) {
            return this.where({challengeID: challengeID})
        }
    } });

flagSchema.methods.getUniqueID = function getUniqueID() {
    const uniqueID = this.challengeID + '_' + this.flagID
    return uniqueID
};

const Challenge = mongoose.model('Challenge', challengeSchema);
const ChallengeParticipation = mongoose.model('challengeParticipation', challengeParticipationSchema);
const Player = mongoose.model('Player', playerSchema);
const FlagsObtained = mongoose.model('FlagsObtained', flagsObtainedSchema);
const Flag = mongoose.model('Flag', flagSchema);

module.exports = {
    Challenge: Challenge,
    ChallengeParticipation: ChallengeParticipation,
    Player: Player,
    FlagsObtained: FlagsObtained,
    Flag: Flag
}