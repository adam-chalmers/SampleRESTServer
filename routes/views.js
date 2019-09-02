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
        apiKey: req.user.apiKey,
        simpleObject: {
            key1: "FirstKey",
            key2: "SecondKey",
            key3: "ThirdKey"
        },
        simpleArray: [ "One", "Two", "Three", "Four", "Five" ],
        objectArray: [
            {
                first: "Dog",
                second: "Cat",
                third: "Bird"
            },
            {
                first: "Red",
                second: "Green",
                third: "Blue"
            },
            {
                first: "Pizza",
                second: "Burger",
                third: "Fries"
            }
        ],
        tiles: [
            {
                colour: "red",
                height: 100
            },
            {
                colour: "green",
                height: 200
            },
            {
                colour: "blue",
                height: 300
            },
            {
                colour: "cyan",
                height: 200
            },
            {
                colour: "magenta",
                height: 300
            },
            {
                colour: "yellow",
                height: 100
            },
        ]
    });
}

module.exports = routes;