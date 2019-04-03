const passport = require('passport');
const passportJWT = require('passport-jwt');
const passportBasic = require('passport-http');

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
    'jwtFromRequest': passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    'secretOrKey': 'SECRET'
}

const basic = new passportBasic.BasicStrategy(basicAuth);
const jwt = new passportJWT.Strategy(jwtArgs, jwtAuth);

async function basicAuth(username, password, done) {
    let user = users.getUserByUsername(username);
    if (!user) return done(null, false);

    let passwordMatches = await users.verifyPassword(user.password, password);
    if (!passwordMatches) return done(null, false);

    return done(null, user);
}

function jwtAuth(payload, done) {
    let user = users.getUserByID(payload.ID);
    if (!user) return done(null, false);

    return done(null, user);
}

passport.use(basic);
passport.use(jwt);

module.exports = passport;