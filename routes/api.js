const passport = require('../passport');

function routes(app) {
    app.get('/api/test', test);

    app.post('/api/postTest', postTest);

    app.get('/api/authTest', passport.authenticate('basic'), authTest);

    app.get('/api/keyTest', passport.authenticate('headerapikey'), keyTest);
}

function test(req, res) {
    res.status(200).json({
        'success': true,
        'message': 'Hello World!'
    });
}

function postTest(req, res) {
    let message = req.body.message;

    if (message) {
        res.status(200).json({
            'success': true,
            'message': `Your message was:\n"${message}"`
        });
    }
    else {
        res.status(400).json({
            'success': false,
            'message': 'No message was present in the request body.'
        });
    }
}

function authTest(req, res) {
    res.status(200).json({
        'success': true,
        'username': req.user.username
    });
}

function keyTest(req, res) {
    res.status(200).json({
        'success': true,
        'user': req.user.username
    });
}

module.exports = routes;