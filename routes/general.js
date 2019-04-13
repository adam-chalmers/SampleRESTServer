const jwt = require('jsonwebtoken');

const users = require('../sql/users');

function routes(app) {
    app.post('/auth', auth);
}

async function auth(req, res) {
    let user = users.getUserByUsername(req.body.username);
    if (!user) {
        res.status(200).json({
            'success': false,
            'message': 'Username or password was incorrect.',
        });
        return;
    }

    let verified = await users.verifyPassword(user.password, req.body.password);
    if (!verified) {
        res.status(200).json({
            'success': false,
            'message': 'Username or password was incorrect.',
        });
        return;
    }

    req.login(user, { session: false }, (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        let token = jwt.sign({ "id": user.id, "administrator": user.administrator }, 'SECRET');
        res.cookie('jwt', token, { 'maxAge': 3600000 });
        res.json({
            "user": user.username,
            "token": token,
            "success": true,
        });
    });
}

module.exports = routes;