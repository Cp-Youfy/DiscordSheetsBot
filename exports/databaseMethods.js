const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { inlineCode } = require('discord.js');
const { BONUS_WITHIN_TIME_LIMIT, BONUS_WITHIN_TIME_LIMIT_MULTIPLIER, FIRST_BLOOD_ADDITIONAL_POINTS } = require('./CHALLENGE_CONSTANTS.json')
const assert = require('assert');
const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DEFAULT_CHANNEL_LOG_ID } = require('../config.json');
const { Challenge, Player, FlagsObtained, Flag, Scoreboard, LongAnswer } = require('./challengeSchemas.js');

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
    if (!existingPlayer) {
        const dateCreated = new Date();
        const player = new Player({ _id: discordID, name: name, registrationDate: registrationDate, dateCreated: dateCreated });
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
async function createFlag(challengeID, flag, flagTitle, flagInfo, value, submissionOpenDate) { 
    await mongoose.connect(uri);
    const dateCreated = new Date();

    // Attempts typecasting to date
    try {
        const submissionOpenDateProc = new Date(submissionOpenDate);
        // checks if the flag specified is already used
        const existingFlag = await Flag.find({ challengeID: challengeID, flag: flag });
        if (existingFlag.length != 0) {
            return "Flag is already used in the challenge.";
        } else {
            const newFlag = new Flag({ challengeID: challengeID, flag: flag, flagTitle: flagTitle, flagInfo: flagInfo, value: value, isLongAns: false, submissionOpenDate: submissionOpenDateProc, dateCreated: dateCreated });
            await newFlag.save();

            return `Flag added successfully. The flag ID is ${newFlag['_id'].toString()}`;
        }
    } catch (err) {
        if (err.startsWith("Flag validation failed: submissionOpenDate")) {
            return "Submission date not of correct format"
        }
    }    
}

/**
 * @param {String} discordID
 * @returns {String} playerName
 */
async function findPlayerName(discordID) {
    await mongoose.connect(uri);

    const playerDoc = await Player.find({ _id: discordID });
    if (playerDoc.length == 0) {
        throw new Error("Player not found");
    } else {
        const player = playerDoc[0];
        return player.name;
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
    const existingPlayer = await Scoreboard.find({ challengeID: challengeID, playerID: discordID });
    const challenge = await findChallenge(challengeID) // throws error if not found
    const isOpen = challenge.isOpen
    const isOver = (new Date() > new Date(challenge.startDate.getTime() + challenge.duration));
    const playerRegistered = await Player.findById(discordID);

    if (existingPlayer.length != 0) {
        throw new Error("Player has already joined the specified challenge.");
    } else if (!isOpen) {
        throw new Error("The specified challenge is not currently open.")
    } else if (isOver) {
        // Check if the challenge is over (implicitly implies that it should not be open...)
        throw new Error("The specified challenge has ended.")
    } else if (!playerRegistered) {
        // Check if player has registered with the bot
        throw new Error("Player has not registered. Use `/register` to register.")
    } else {
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
        // Some params have default values but can be modified
        // it is not in the modal due to the numFields <= 5 Discord API restriction
        const challenge = new Challenge({ name: name, organiser: organiser, startDate: inputStartDate, duration: inputDuration, isHiddenID: true, longAnsChannelID: longAnsChannelID, isOpen: false, isTargeted: false, isBonusTimeLimit: false, isFirstBlood: false, dateCreated: dateCreated, logChannelID: DEFAULT_CHANNEL_LOG_ID, puzzleMakerID: '123456789012456789' });

        // While name is not the primary key, we want to avoid duplicate names for challenges to avoid confusion
        const existingChallenge = await Challenge.find({ name: name });
        if (existingChallenge.length > 0) {
            return "A challenge with the same name already exists.";
        } else {
            await challenge.save();
            return `Challenge ${name} created successfully. Use the ${inlineCode('display')} option to check the details.`
        }
    } catch (err) {
        console.log(err)
        return "Input not of correct format."
    }    
}

/**
 * Checks for the validity of a flag; if correct, updates Scoreboard and FlagsObtained accordingly
 * @param {String} flagString 
 * @param {String} challengeID 
 * @param {String} discordID 
 * @param {String | Null} additionalInput
 * @returns {String}
 */
async function submitFlag(flagString, challengeID, discordID, additionalInput, puzzle_id=null) {
    await mongoose.connect(uri);

    const scoreboardPlayer = await Scoreboard.find({ challengeID: challengeID, playerID: discordID });
    if (scoreboardPlayer.length == 0) {
        const challengeIdAsObjectId = new ObjectId(challengeID)
        const existingChallenge = await Challenge.findById(challengeIdAsObjectId)
        if (existingChallenge.length == 0) {
            throw new Error("Challenge does not exist: Is your challenge ID correct?")
        } else {
            throw new Error(`You have not joined the challenge. Use ${inlineCode('/challenge join ' + challengeID) } to join the challenge first.`);
        }
    }

    const challenge = await findChallenge(challengeID);

    // Searches with puzzle ID if necessary
    const flagArr = await (puzzle_id === null ? 
        Flag.find({ challengeID: challengeID, flag: flagString }) :
        Flag.find({ challengeID: challengeID, flag: flagString, _id: new ObjectId(puzzle_id) })
    );
    
    if (!flagArr || (Array.isArray(flagArr) && flagArr.length === 0)) {
        return "Wrong flag";
    }

    const flag = Array.isArray(flagArr) ? flagArr[0] : flagArr;
    const dateCreated = new Date();

    if (flag.submissionOpenDate - dateCreated > 0) {
        // Submission is not open
        return `Puzzle submission is not open. It will open at ${flag.submissionOpenDate}`
    }

    const hasAdditionalInput = flag.isLongAns;
    const flagValue = flag.value;

    const existingSubmission = await FlagsObtained.find({ challengeID: challengeID, playerID: discordID, flag: flag.flag });

    if (hasAdditionalInput && additionalInput == null) {
        return "Additional input required for this challenge.";
    }

    if (hasAdditionalInput) {
        if (additionalInput.length > 1800) {
            return "Additional input must be of maximum length 1800 characters. Please attach pastebin link or something similar instead."
        }
        // Handle additional input puzzle logic differently
        const longAnsSubmission = new LongAnswer({ challengeID: challengeID, playerID: discordID, flagID: flag._id, contents: additionalInput })
        await longAnsSubmission.save();

        return `LongAnsID|${longAnsSubmission._id}|${flag.flagTitle}|${additionalInput}`
    }

    if (existingSubmission.length == 0) {
        const flagSubmission = new FlagsObtained({ challengeID: challengeID, playerID: discordID, flag: flagString, dateCreated: dateCreated });
        await flagSubmission.save();
    } else {
        return "Flag has been submitted before";
    }

    // Adds time limit bonus if applicable
    const dateNow = new Date()
    const withinHours = ((flag.submissionOpenDate - dateNow) / (1000 * 60 * 60) <= BONUS_WITHIN_TIME_LIMIT); // ms to hours -- checks against hour cap for bonus
    var flagValueProc = ( challenge.isBonusTimeLimit == true && withinHours ?
        flagValue * BONUS_WITHIN_TIME_LIMIT_MULTIPLIER : // if within time limit, multiply score
        flagValue
    )

    // Adds first blood bonus if applicable
    const submissions = await FlagsObtained.find({ challengeID: challengeID, flag: flag.flag })
    const isFirstSubmission = (submissions.length == 1) // 1 for this flag submission
    flagValueProc = ( challenge.isFirstBlood == true && isFirstSubmission == true ?
        flagValueProc + FIRST_BLOOD_ADDITIONAL_POINTS :
        flagValueProc
    )

    const scoreboardUpdateRes = await Scoreboard.findOneAndUpdate({ challengeID: challengeID, playerID: discordID }, { $inc: { scoreValue: flagValueProc } });

    if (scoreboardUpdateRes.length == 0) {
        // default error handling
        throw new Error("Scoreboard update unsuccessful: No scoreboard entry found.");
    }

    return `Flag submission successful! You have gained ${flagValueProc} points.`
}

async function addPoints(pointsToAdd, challengeID, playerID) {
    await mongoose.connect(uri);
    const points = Number(pointsToAdd);
    
    const scoreboardUpdateRes = await Scoreboard.findOneAndUpdate({ challengeID: challengeID, playerID: playerID }, { $inc: { scoreValue: points } });
    if (!scoreboardUpdateRes) {
        return "User is not registered for this challenge."
    }

    return `Points modified successfully.`
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
                throw new Error("Challenge not found");
            } else if (challenge.length > 1) {
                throw new Error(multipleChallengesErrMsg);
            } else {
                return challenge[0];
            }
        } else if (challengeById.length > 1) {
            throw new Error(multipleChallengesErrMsg);
        } else {
            // 0th index not required -- recall id is unique so findById returns only one document
            return challengeById;
        }
    } catch (err) {
        // id string is not even valid
        const challenge = await Challenge.find({ name: param });
        if (challenge.length == 0) {
            throw new Error("Challenge not found.");
        } else if (challenge.length > 1) {
            throw new Error(multipleChallengesErrMsg);
        } else {
            return challenge[0];
        }
    }    
}

async function findLongAns(longAnsID) {
    await mongoose.connect(uri);

    try {
        const paramAsObjectId = new ObjectId(longAnsID);
        const longAnsById = await LongAnswer.findById(paramAsObjectId);
        
        if (longAnsById.length == 0) {
            throw new Error('Long answer entry not found');
        } else if (longAnsById.length > 1) {
            throw new Error("Unexpected behaviour: Multiple long answers found (findLongAns).");
        }
        else {
            return longAnsById;
        }
    } catch (err) {
        if (err.message.startsWith('input must be a 24 character hex string')) {
            throw new Error("Invalid long answer ID format")
        }
        else {
            // Default error handling
            throw new Error(err.message)
        }
    }
}

/**
 * Looks up the flag from MongoDB by its id and returns it as a mongoose.Document object.
 * If not found, throw an error (for response via error handling)
 * @param {String} param Flag ID
 */
async function findFlag(param) {
    await mongoose.connect(uri);
    try {
        const paramAsObjectId = new ObjectId(param);
        const flagById = await Flag.findById(paramAsObjectId);
        
        if (flagById.length == 0) {
            throw new Error('Flag not found');
        } else if (flagById.length > 1) {
            return "Unexpected behaviour: Multiple flags found (findFlag).";
        }
        else {
            return flagById;
        }
    } catch (err) {
        if (err.message.startsWith('input must be a 24 character hex string')) {
            throw new Error("Invalid flag ID format")
        }
        else {
            // Default error handling
            throw new Error(err.message)
        }
    }
}

async function findScore(challengeID, discordID) {
    await mongoose.connect(uri);

    const res = await Scoreboard.find({ challengeID: challengeID.toString(), playerID: discordID });
    if (res.length == 0) {
        throw new Error("Scoreboard entry does not exist. Have you joined the challenge?")
    } else {
        return res[0].scoreValue
    }
}

async function findFlagsByChallengeID(challengeID) {
    await mongoose.connect(uri);

    // Check if challenge ID is valid
    try {
        findChallenge(challengeID);
    } catch (err) {
        if (err.message == "Challenge not found.") {
            return err.message
        } else {
            throw new Error(err.message)
        }
    };

    // Return list of documents
    const res = await Flag.find({ challengeID: challengeID });

    if (res.length == 0) {
        return "No flags found for the specified challenge."
    } else {
        return res
    }
}

module.exports = {
    registerUser,
    joinChallenge,
    createChallenge,
    submitFlag,
    findChallenge,
    createFlag,
    addPoints,
    findFlag,
    findPlayerName,
    findScore,
    findLongAns,
    findFlagsByChallengeID
}