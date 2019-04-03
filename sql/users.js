const credential = require('credential')();

const user = {
    'id': 1,
    'username': 'tutorial',
    'administrator': true
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

async function hashPassword(password) {
    return await credential.hash(password);
}

async function verifyPassword(hashed, password) {
    return await credential.verify(hashed, password);
}

module.exports = {
    'getUserByID': getUserByID,
    'getUserByUsername': getUserByUsername,
    'verifyPassword': verifyPassword
};