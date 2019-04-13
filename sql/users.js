const credential = require('credential')();
const uuidv4 = require('uuid/v4');

const user = {
    'id': 1,
    'username': 'tutorial',
    'administrator': true,
    'apiKey': '10ba038e-48da-487b-96e8-8d3b99b6d18a',
}
hashPassword('password123').then(function(value) {
    user.password = value;
    console.log("User setup complete.");
});

function getUserByID(id) {
    // TODO replace with database lookup
    if (id === 1) return user;

    return false;
}

function getUserByUsername(username) {
    // TODO replace with database lookup
    if (username === 'tutorial') return user;

    return false;
}

function getUserByAPIKey(apiKey) {
    // TODO replace with database lookup
    if (apiKey === user.apiKey) return user;

    return false;
}

async function hashPassword(password) {
    return await credential.hash(password);
}

async function verifyPassword(hashed, password) {
    return await credential.verify(hashed, password);
}

function createAPIKey() {
    return uuidv4();
}

module.exports = {
    'getUserByID': getUserByID,
    'getUserByUsername': getUserByUsername,
    'getUserByAPIKey': getUserByAPIKey,
    'verifyPassword': verifyPassword,
    'createAPIKey': createAPIKey
};