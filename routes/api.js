function routes(app) {
    app.get('/api/test', test);

    app.post('/api/postTest', postTest);
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

module.exports = routes;