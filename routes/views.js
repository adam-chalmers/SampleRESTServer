const passport = require('../passport');

function routes(app) {
    app.get('/', passport.authenticate('jwt', {
        successRedirect: '/user',
        failureRedirect: '/login'
    }));

    app.get('/index', index);

    app.get('/login', login);

    app.get('/user', passport.authenticate('jwt', { session: false }), user);
}

function index(req, res) {
    res.status(200).render('../views/index');
}

function login(req, res) {
    res.status(200).render('../views/login');
}

function user(req, res) {
    res.status(200).render('../views/user', {
        username: req.user.username,
        apiKey: req.user.apiKey
    });
}

module.exports = routes;