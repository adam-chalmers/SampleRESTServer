const express = require('express');
const bodyParser = require('body-parser');
const swig = require('swig');

const passport = require('./passport');
const api = require('./routes/api');
const views = require('./routes/views');

const port = 3000;
const app = express();
const parser = bodyParser.json();
const engine = new swig.Swig();

app.use(parser);
app.engine('html', engine.renderFile);
app.set('view engine', 'html');
app.use('/', express.static('public'));
app.use(nocache);

app.use(passport.initialize());

api(app);
views(app);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}