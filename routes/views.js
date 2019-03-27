function routes(app) {
    app.get('/index', index);
}

function index(req, res) {
    res.status(200).render('../views/index', {
        title: 'Index Page',
        css: [
            '//localhost:3000/css/style.css'
        ],
        js: [
            '//localhost:3000/js/index.js'
        ]
    });
}

module.exports = routes;