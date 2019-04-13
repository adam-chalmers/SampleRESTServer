const passport = require('passport');
const passportJWT = require('passport-jwt');
const passportBasic = require('passport-http');
const passportAPI = require('passport-headerapikey');

const users = require('./sql/users');

passport.serializeUser(function(user, done) {
    // TODO create an object that is a subset of the full user object.
    done(null, user);
});

passport.deserializeUser(async function(user, done) {
    // TODO implement a database lookup using the user subset to return the full user object.
    done(null, user);
});

const jwtArgs = {
    'jwtFromRequest': cookieExtractor,
    'secretOrKey': 'SECRET'
}

const apiArgs = {
    'header': 'Authorization',
    'prefix': 'Api-Key'
};

const basic = new passportBasic.BasicStrategy(basicAuth);
const jwt = new passportJWT.Strategy(jwtArgs, jwtAuth);
const api = new passportAPI.HeaderAPIKeyStrategy(apiArgs, false, apiAuth);

async function basicAuth(username, password, done) {
    let user = users.getUserByUsername(username);
    if (!user) return done(null, false);

    let passwordMatches = await users.verifyPassword(user.password, password);
    if (!passwordMatches) return done(null, false);

    return done(null, user);
}

function jwtAuth(payload, done) {
    let user = users.getUserByID(payload.id);
    if (!user) return done(null, false);

    return done(null, user);
}

function cookieExtractor(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
}

function apiAuth(apiKey, done) {
    let user = users.getUserByAPIKey(apiKey);
    if (!user) return done(null, false);

    return done(null, user);
}

passport.use(basic);
passport.use(jwt);
passport.use(api);

module.exports = passport;