const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const swig = require('swig');

const passport = require('./passport');
const general = require('./routes/general');
const api = require('./routes/api');
const views = require('./routes/views');
const config = require('./config');

const app = express();
const engine = new swig.Swig();

app.locals.config = config;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.engine('html', engine.renderFile);
app.set('view engine', 'html');
app.use('/', express.static('public'));
app.use(nocache);

app.use(passport.initialize());

api(app);
general(app);
views(app);

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});


function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}