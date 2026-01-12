/*
Contains schemas for server-specific data
*/

const mongoose = require('mongoose');

const serverBotAdminSchema = new mongoose.Schema({
    serverID: { type: String, required: true, unique: true },
    roleID: { type: String, required: true },
}, {
    collection: 'serverBotAdmins'
})

// const ServerBotAdmin = mongoose.model('ServerBotAdmin', serverBotAdminSchema);

module.exports = {
    serverBotAdminSchema,
}