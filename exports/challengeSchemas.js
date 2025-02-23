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
    logChannelID: {type: String || null, required: true},
    isTargeted: { type: Boolean, required: true }, // whether puzzle ID must be specified for submissions
    isBonusTimeLimit: { type: Boolean, required: true }, // whether points are multiplied by multiplier if puzzle is submitted within a specified time limit
    isFirstBlood: { type: Boolean, required: true }, // whether additional points are given to the first solver of a puzzle
    puzzleMakerID: { type: String, required: true } // role ID of puzzle makers - can validate long answers
}, { collection: 'challenges',
    query: {
        challengeNameToID(challengeName) {
            return this.id.where({ challengeName: challengeName })
        }
    }
});

const playerSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // String, not ObjectId
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
    dateCreated: { type: Date, required: true },
    submissionOpenDate: { type: Date, required: true } // date from which to allow submissions of flag
    
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

const longAnswerSchema = new mongoose.Schema({
    challengeID: { type: String, required: true }, // challenge ID for puzzle submission
    playerID: { type: String, required: true }, // discord ID of submitting player
    flagID: { type: String, required: true }, // Flag._id
    contents: { type: String, required: true }, // the long answer
}, {
    collection: 'longAnswers'
})

const Challenge = mongoose.model('Challenge', challengeSchema);
const Player = mongoose.model('Player', playerSchema);
const FlagsObtained = mongoose.model('FlagsObtained', flagsObtainedSchema);
const Flag = mongoose.model('Flag', flagSchema);
const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);
const LongAnswer = mongoose.model('LongAnswer', longAnswerSchema)

module.exports = {
    Challenge: Challenge,
    Player: Player,
    FlagsObtained: FlagsObtained,
    Flag: Flag, 
    Scoreboard: Scoreboard,
    LongAnswer: LongAnswer
}