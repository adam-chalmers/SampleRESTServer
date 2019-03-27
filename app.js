const express = require('express');
const bodyParser = require('body-parser');

const api = require('./routes/api');

const port = 3000;
const app = express();
const parser = bodyParser.json();

app.use(parser);

api(app);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});