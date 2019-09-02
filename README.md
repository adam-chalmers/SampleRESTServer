# SampleRESTServer
A basic REST server using express.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Visual Studio Code
https://code.visualstudio.com/download
Make sure you download the system installer, not the user installer.

Node.js
https://nodejs.org/en/download/

## Setup

Create a folder for your application, and open it in Visual Studio Code.
In that folder, create a new file, named app.js.

You'll also want to set up your keybindings to mirror Visual Studio, which you can do through File > Preferences > Keymaps, and choose the Visual Studio keymaps.

Put the following into your app.js:

```
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
```

Here, req and res are short for request and response, and are commonly used variable names given to objects representing the HTTP request and HTTP response.

To configure app.js as the entry point:
Debug > Open Configurations...
Modify the 'program' value so that it points to app.js.

You can now debug your application by pressing F5. Going to the endpoint configured above (http://localhost/3000) should display the Hello World message as defined above.

## Explanation

What we've done above is fairly self explanatory. we create an HTTP server, configure the host and port, and configure what requests will return. That's a very basic server, but it works.

In node, you have "modules". these modules export objects, which expose the module's functionality. "require" can be thought of somewhat like "using" in C#, except instead of importing all the methods and classes from the namespace being imported, you instead get an object which you have to reference first.
Example: the http module exports the 'createServer' function. In C#, you could do 
```
using http;
```
and you'd simply be able to call "createServer" from wherever you wanted. In Node, we "require" the module, and store it in a variable which we then reference later, like so:
```
const http = require('http');
http.createServer();
```

## Going Further

Certain modules are built in, such as the http module, but others need to be installed via npm (node package manager). In our case, we're going to use a module called express.

In a terminal (Terminal > New Terminal), run:
```
npm install --save express
```
--save here is optional, and depends on how you want to deploy your application. It saves which modules you install to a .json file, which can then be checked in to source control and allows the dependencies to be downloaded wherever the application is deployed, without requiring that they be checked in to source control. For ease of use, I've chosen to include the dependencies in source control since there aren't a huge number of them.

Now, we can change our app.js so that we're using the express HTTP server, rather than the built in server. Change your app.js so that it looks like the following:
```
const express = require('express');

const port = 3000;
const app = express();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

Looks simple enough, and we can see how the express module exports the 'express' function, which we use to instantiate an instance of the server, stored in the 'app' variable. This will start up a server, but we haven't configured any endpoints yet. How do we do that?
```
app.get('/api/test', function(req, res) {
    res.status(200).json({
        'success': true,
        'message': 'Hello World!'
    });
});
```
But that'll need to be done for every single endpoint we want to configure, which will end up making a very big file.

## Modules

Here's where we can make our own modules to solve the above problem. Create a folder named routes, and a file under this folder named api.js. This is where we'll configure our API endpoints.

Inside the api.js, we want to use the following:
```
function routes(app) {
    app.get('/api/test', test);
}

function test(req, res) {
    res.status(200).json({
        'success': true,
        'message': 'Hello World!'
    });
}
```

This is similar to above, but I've separated out the endpoint function into a proper function, rather than an anonymous one. Obviously this will make having many endpoint configurations cleaner and easier to read.
But how do we provide the functionality in here to other places?
```
module.exports = routes;
```
This configures the api module to export the routes function. Back in app.js, we can add
```
const api = require('./routes/api');
```
This then makes the routes function available to our app.js entry point, and all we need to do now is add
```
api(app);
```
And our application will pass the express server instance into the api.routes() function, where it will configure all the endpoints we set up in said function. In this way, you can separate your endpoints out into modules, based on their functionality. You can make these modules more granular if you wish, such as having an api folder instead of an api module, with multiple modules under that folder separated based on functionality. Later on, we'll add a views module which will allow us to configure endpoints that respond with HTML for a frontend to our application.

Start your application, and if you go to http://localhost:3000/api/test, you should see the JSON response configured above.

## POSTing and the Request Body

What if we want to use a body with our request? First, we'll need a way to parse the JSON body:
```
npm install --save body-parser
```
In our app.js, we'll want to add:
```
const bodyParser = require('body-parser');

...

const parser = bodyParser.json();

...

app.use(parser);
```

In this case, we import the body-parser module, and use the 'json' function to instantiate middleware that is in charge of parsing json bodies in HTTP requests. We supply the middleware to express using the 'use' function. This then configures the middleware to be run on all endpoints. Alternatively, if you only want it to be run on select endpoints, you can pass it into the endpoint configuration methods. For example:
```
app.get('/api/test', parser, test);
```
In which parser is the middleware as defined above.

Now that we've configured express to be able to parse JSON bodies, we have access to a body object in the request object, and can add the following endpoint configuration to our api.js:
```
function routes(app) {
...
    app.post('/api/postTest', postTest);
...
}

...

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
```

Some things of note about the above code:
 - Javascript string interpolation works much like C#, but only works for strings that are defined using backtick characters (`), and won't work for strings defined using single or double quote characters.
 - Javascript compiles files in two stages. First, it does a pass for all variable declarations using the 'var' keyword, and then essentially moves all those variables to the top of the functions in which they are defined. This means that variables defined using the 'var' keyword can be used before they're even defined, and don't have scope within the method they're defined in. Variables defined using the 'let' keyword do have scope, and function as you'd expect variables do in C#. I don't see 'let' used as commonly, and I think it's a newer feature and may not be supported on all browsers. Same with the string interpolation in the previous point. They're fine to use server-side, since the code is always running in the same environment and compatibility isn't an issue, but it's risky to use these in client-side JS since you can't guarantee the browser running the code will support the features.
 
Since we previously configured the api module to export the routes function, and we've configured our postTest endpoint inside the routes function, we don't need to changeanything more in our app.js file to be able to access our new endpoint. Since we've configured this new endpoint to use the POST method, we won't be able to use a browser totest it. Install Postman, and POST to <SITE ROOT>/api/postTest with an empty body and you should get the 400 status back, with our failure message as before. This is because we didn't supply a message. Add a message to the body, and you should get the 200 status back, with our success message that displays what the input message in the body was.

## Views

There are multiple ways to serve HTML using express. You can use express to serve static files (which is how we'll be serving client-side JS and CSS), or you could use express to map individual endpoints to pages, as we're going to do here.

We're also going to use an HTML templating engine, called swig. HTML templating engines allow you to define sets of HTML that you can use heirarchically, along with allowing you to serve dynamic HTML.

First of all, we're going to want to disable caching so we don't have to restart our server every time we make changes to our html/css/js files. We can do this by adding an express middleware function that adds no-cache headers to all our responses. In app.js:
```
function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}
...
app.use(nocache);
```
Note the use of the next() function - the 'next' parameter is an optional parameter (hence its omission in all our express endpoints), and is a pointer to a method that calls the next middleware function. Hence, as long as we configure express to use the middleware BEFORE we configure our endpoints, the above function will run beforehand and all our served html will have the headers set. This can be removed later, for effiency.

Add swig:
```
npm install --save swig
```
Then, create a folder named 'views', which is where we'll store our html templates.

We'll start with a base layout template under '/views/layout.html':
```
<!DOCTYPE html>
<html>
    <head>
        {% set siteRoot = "<LOCAL IP HERE>:3000" %}
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{% block title %}{% endblock %}</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    </head>
    <body id="{% block id %}{% endblock %}">
        <div class="container">
            <div class="row">
                <div class="col-12 d-flex justify-content-around">
                    <h1>{% block title %}{% endblock %}</h1>
                </div>
            </div>
            {% block content %}
            {% endblock %}
        </div>
        <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
    </body>
</html>
```
The above template defines a head that contains the title and a link to bootstrap css, and a body that uses jQuery, boostrap's js and popper.js (all of which are required by bootstrap), plus several blocks. The blocks are where the templating magic happens, but first some notes on the above:
 - We define a variable for our site root - this is so we can easily refer back to this across our site and replace it in one place if we move the domain. For example, when writing this, I started out using 'localhost:3000', but then found that the site wasn't working properly when I tested on my phone. So I then changed it to my local IP address so it would work on both, but you could host it on a server somewhere and use DDNS if you wanted.
 - We include a viewport meta tag so that the site displays nicely on mobiles, nothing special.
 - Blocks are essentially parts of the template that can be specified by any template that inherits this one. Our 'id' block allows inheriting templates to define their own IDs, so we can target specific pages with CSS if we want to. The 'title' block allows inheriting templates to define their own titles, and the 'content' block is where the majority of the page's content will be specified by child templates.

Now that we have a base template, we can create '/views/index.html':
```
{% extends 'layout.html' %}

{% block title %}Index Page{% endblock %}

{% block content %}
    <p>Welcome to {{ title }}</p>
{% endblock %}
```
This file defines content, which will be substituted into the content block defined in the layout template. It also defines a title block, which we'll get back to soon.

Next, we need to configure express to use swig as the template engine in our app.js:
```
const swig = require('swig');
...
const engine = new swig.Swig();
app.engine('html', engine.renderFile);
app.set('view engine', 'html');
```

Next up, we need to configure an endpoint in express to serve the index.html page. To do this, we'll set up another module similar to the api.js module, but this time we'll handle all our view endpoints. Under the routes folder, create a file called views.js:
```
function routes(app) {
    app.get('/index', index);
}

function index(req, res) {
    res.status(200).render('../views/index');
}

module.exports = routes;
```
It has a similar structure to our api.js, but this time instead of using .json to return json, we're using .render to return HTML using swig as our configured templating engine. Note that the render method here takes two arguments - a relative path to the html file, and an object which will be used to fill the variables we defined in our template. In this case, the index template had just one - remember the title block we said we'd come back to? That's where that block comes into play. In this way, you can use templates to fill in all sorts of details, whether it's simple strings like we're using here, to full sections of html based on whatever logic you'd like. Note that you have access to the req object, so you can easily access things like query parameters in the URL, etc. and use those however you see fit.

Now that we've set up another set of routes for our views, don't forget to add the endpoint configurations to our app.js:
```
const views = require('./routes/views);
...
views(app);
```

Now, start up the application again and go to http://localhost:3000/index, and you should see our index page!

## Serve Static Files

With most webpages, we'll also want to serve up our own custom css and javascript files. Express makes this very easy to do, using the express.static middleware:
```
app.use('/', express.static('public'));
```
Create a public folder under the application root folder, and then two folders inside that called 'css' and 'js'. The public folder now essentially acts as a file server, allowing us to put our own javascript and css into it and link to them.

For example, if we create a file in the public/css folder called 'style.css':
```
body .container h1 {
    color: red;
}
```
And add a link in our base layout template to our css:
```
<link rel="stylesheet" href="//{{ siteRoot }}/css/style.css">
```
If we reload the index page, we should now see our own css take effect, with red header text.

Adding our own js to the page is just as simple. First, create a file in the public/js folder called 'index.js':
```
jQuery(document).ready(function($) {
    alert('Page Loaded!');
});
```
And add a link in our base layout template to our js:
```
<script type="text/javascript" src="//{{ siteRoot }}/js/index.js"></script>
```
Then when you reload the server and the page, you should see an alert pop up when you load the index page.

Of course, we didn't have to add these to the base layout. We could've just as easily added them to the index.html page instead, if we make a couple tweaks to our base layout:
```
<!DOCTYPE html>
<html>
    <head>
        {% set siteRoot = "<LOCAL IP HERE>:3000" %}
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{% block title %}{% endblock %}</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        {% block css %}
        {% endblock %}
    </head>
    <body id="{% block id %}{% endblock %}">
        <div class="container">
            <div class="row">
                <div class="col-12 d-flex justify-content-around">
                    <h1>{% block title %}{% endblock %}</h1>
                </div>
            </div>
            {% block content %}
            {% endblock %}
        </div>
        <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        {% block js %}
        {% endblock %}
    </body>
</html>
```
This then allows us to specify our own css and js per page in the page templates themselves:
```
{% extends 'layout.html' %}

{% block title %}Index Page{% endblock %}

{% block css %}
    <link rel="stylesheet" href="//localhost:3000/css/style.css">
{% endblock %}

{% block js %}
    <script type="text/javascript" src="//localhost:3000/js/index.js"></script>
{% endblock %}

{% block content %}
    <p>Welcome to {{ title }}</p>
{% endblock %}
```

## SASS

Sass is a beautiful thing. It's a CSS extension language, meaning it compiles down to css. It's written almost exactly the same, but with a couple key differences, such as variables, nesting and partials. Sass files are given the extension .scss.

Variables are self-explanatory. You can define a variable in a sass file, and then easily reference it elsewhere for consistency:
```
$site-font: 'Helvetica', 'Arial', sans-serif;

body {
    font-family: $site-font;
}
```
Importantly, none of the compilation is done at runtime. It's all compiled to CSS separately, so when the CSS is compiled it'll look like the following:
```
body {
    font-family: 'Helvetica', 'Arial', sans-serif;
}
```

Nesting is amazing for making css easier to both read and write. It allows you to specify properties for elements, and properties for their children without having to write out all the parent selectors again. Take the following example in regular css:
```
body {
    background: black;
}
body .container {
    background: white;
}
body .container h1 {
    color: red;
}
```
Having to repeat the body and .container selectors each time can get tedious, especially when there are many child elements that you want to style. Sass makes this much easier:
```
body {
    background: black;

    .container {
        background: white;

        h1 {
            color: red;
        }
    }
}
```

You can also use the ampersand symbol with nesting to combine selectors as if they'd been written without a space in between. For example, if you wanted all divs to be black, but divs with the 'container' class to be white, the CSS would look like the following:
```
div {
    background: black;
}
div.container {
    background: white;
}
```
In sass, we can write the following:
```
div {
    background: black;

    &.container {
        background: white;
    }
}
```
Much easier.

Of course, you can nest media queries, too:
```
div {
    background: black;

    @media screen and (min-width: 800px) {
        background: white;
    }
}
```
This would make all divs white on devices with a width of at least 800px, and black on all other devices.

Partials are another great tool, allowing you to separate out your files, but still have them compile down to a single .css file. Let's say we have two files, one for general CSS that should be applied to all pages, and another for CSS that should only be applied to individual pages. We can use a master .scss file, and import all our other .scss files, resulting in a single .css file after compilation.
```
@import '_general.scss';
@import '_pages.scss';
```
Note that with the above setup, we'd be able to define variables in our general.scss file, and have them available to the _pages.scss file because the _general.scss file is compiled first. This would allow you to set up standard fonts and colours for your site in one place, but still reference them across all scss files. Note also the underscores preceeding the partial file filenames - these tell sass that these files shouldn't be compiled into files themselves.

## Using SASS

First of all, we're going to want sass:
```
npm install -g node-sass
```
We're using -g here to install it globally, and make node-sass available on the command line. (Note that it will be installed to %appdata%/npm, which should also have been added to your user environment variables. If you're getting errors saying node-sass wasn't found, try restarting your pc).

Create a new folder in the application root, called 'scss'. Here's where we're going to store our sass files. We'll be creating three: style.scss, _general.scss and _pages.scss. Note that we've left the scss folder outside of the public folder, as we don't need to serve our sass files to clients - only the compiled css file is required.

style.scss:
```
@import './_general.scss';
@import './_pages.scss';
```

_general.scss:
```
body {
    padding-top: 30px;
}

h1 {
    font-size: 30px;
}
```

_pages.scss:
```
#index {
    .container {
        text-align: center;

        h1 {
            color: blue;
        }
    }
}
```
Note that we're using the _pages.scss to target the index page directly. We'll need to tweak our templates so that we can give our body tags an id. In layout.html:
```
...
<body id="{% block id %}{% endblock %}">
...
```
And in index.html:
```
...
{% block id %}index{% endblock %}
...
```

That just leaves compiling our sass into a css file. This is where installing node-sass globally comes in handy. Create a second terminal (the plus button at the top right of the terminal window in vscode), and run:
```
node-sass --recursive --watch ./scss --output ./public/css
```
Now, every time a scss file is modified in the watch directory (./scss), our sass is compiled into the output directory (./public/css). This means we can make modifications to our scss files and simply refresh our pages to see the changes come through immediately.
We run this in a second terminal, since we may still want to use our first one for npm or other commands, and as long as the node-sass command is running, the terminal is unuseable. Note also that this watch command will need to be run every time vscode is started.


## Promises

Before we move on to the next section, we need to understand Promises, and how they tie in with asynchronous methods. In node, it's quite common to have methods that run asynchronously and take in a callback function that handles the result of the operation. That's all well and good, but what do we do if we want to wait for the callback to run and receive a value returned by that callback? We use a Promise. Promises are so named because they 'promise' to return a value (or throw an error). Promises are created with two arguments: a 'resolve' function pointer and a 'reject' function pointer. Calling the resolve function with an argument causes the Promise to return that value when awaited upon, and calling the reject function with an argument causes the Promise to throw that argument as an error.

For example, if we wanted to log a console message after waiting a certain amount of time:
```
function wait(timeout) {
    setTimeout(function() {
        console.log(`Waited for ${timeout}ms`);
    }, timeout);
}
```
But that doesn't help if, instead of logging a console message, we wanted to return a the time that we wated for. That's where promises come in:
```
function wait(timeout) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(timeout);
        }, timeout);
    });
}

async function doTheThing() {
    let foo = await wait(10000);
}
```
Note the use of the 'await' keyword above. Promises work somewhat like Tasks in C#, in that they can be awaited to retrieve their resolved value. Note also that, again like C#, the use of the 'await' keyword requires the containing function to be declared as 'async'.
While we aren't using promises directly in our code (yet), it's still important to understand how they work, as some of the modules we use later on do return promises, and we'll be using async methods and awaiting on their results.


## Authentication

Let's say we wanted to require a login for users to be able to use our frontend, and needed a token of some kind to use our API. How would we achieve this? A simple way to do so would be to use JSON web tokens (JWTs). A JWT consists of three things: a header consisting of the algorithm and token type (in our case, JWT), a payload consisting of whatever data we choose, and a third portion for verification purposes (see https://jwt.io/ for more). JWTs are signed using a secret, meaning that any JWT created using your secret will always decode using the same secret.
For the front end:
 - Client submits credentials through a login page, using basic HTTP authentication header.
 - Server verifies credentials, and responds with a JWT and a header that gets the browser to store the JWT as a cookie.
 - Client can now access portions of the front-end which require authentication by passing the JWT with each call.
For the API:
 - Expose an API key for each user through the front-end.
Once authentication starts becoming involved, we should be connecting to our server via SSL, to make sure that our credentials aren't being intercepted. This makes it a lot easier for us, because then we don't need to worry about doing any encrypting of the credentials on the client side before sending them through to the server. Setting up SSL isn't something that we need to worry about in our server code, and so is outside the scope of this tutorial since it depends on how you choose to host your server.

## Credential

For this tutorial, we'll be using a module called Credential (https://www.npmjs.com/package/credential).
```
npm install --save credential
```
Credential makes it easy to hash passwords, although the output is a little different to what you might be used to. Instead of just a hashed password string, Credential returns a JSON string containing the hashed password, the salt, and more. This string is then stored in the database. I'd suggest reading up on the page above, as it explains the rationale for why the module works in the way that it does.

## Users

Normally, we'd have a database that we'd store all our info in. For the purposes of this tutorial, we don't really need one and can come back to doing that at a later stage. For now, we'll create a module that simulates verifying a user's credentials against a database, but we'll hardcode a single user for our use. This should make it easier to come back to later on and put in proper database logic once we eventually get one set up. For now, we'll want to create a folder in the root directory called 'sql', and a file inside the new folder called 'users.js'.
```
const credential = require('credential')();

const user = {
    'id': 1,
    'username': 'tutorial',
    'administrator': true
}
hashPassword('password123').then(function(value) {
    user.password = value;
    console.log("User setup complete.");
});

function getUserByID(id) {
    // TODO replace with database lookup
    if (id === 1) return user;

    return false;
}

function getUserByUsername(username) {
    // TODO replace with database lookup
    if (username === 'tutorial') return user;

    return false;
}

async function hashPassword(password) {
    return await credential.hash(password);
}

async function verifyPassword(hashed, password) {
    return await credential.verify(hashed, password);
}

module.exports = {
    'getUserByID': getUserByID,
    'getUserByUsername': getUserByUsername,
    'verifyPassword': verifyPassword
};
```
Note that getUserByID and getUserByUsername would both normally access the database, but instead we simply check against our hardcoded user. False is returned when no match exists, so we can easily check for the 'truthiness' of the result of the query. Note also that we export the 'verifyPassword' function but not the 'hashPassword' function. This is essentially just a way to have public and private functions, as the latter function doesn't really need to be accessed outside of our module.
Also of note is the way we initialise our user - since the user declaration isn't inside a function, it can't be declared async and we can't await on its value. We instead use the returned promise, and call a function after it completes that sets the user password to a password hash JSON string. We include a console log message here just for debug purposes so we know when server initialisation is fully complete.

## Passport

Now that we've set up our "database" and we have a way to check passwords and users, we need to have a way to have our endpoints require authentication. Here's where a module called Passport comes in handy. Using Passport, we can create an Express middleware that can authenticate using different strategies. We can then supply this middleware to our specific endpoints that we want to require authentication on. There are many more modules that can create middleware for other authentication strategies, such as OAuth 2.0, Facebook, Steam (OpenID) and more - see http://www.passportjs.org/packages/ for details.
For our purposes, we'll want the following:
```
npm install --save passport
npm install --save passport-http
npm install --save passport-jwt
```
Create a new file in the application root, called 'passport.js'. To use Passport, we need to initialise authentication strategies and register them with Passport before we can use the middleware.
```
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
    'jwtFromRequest': cookieExtractor,
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

function cookieExtractor(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
}

passport.use(basic);
passport.use(jwt);

module.exports = passport;
```
Several things of note above:
 - Module exports are static, so this code will only ever be run once and a pointer to the same exported object is returned to any file that imports our module. Here, we import the regular passport module, set up our basic and jwt strategies, and then export the configured passport object for use throughout our application, without needing to worry about configuring it every time.
 - Note that we're using a secret in our jwtArgs - this doesn't need to be anything special right now, but it's not particularly good practice to be storing these sorts of things in source code, if that source is ever going to be hosted outside of your network (as is our case here, on GitHub). We'll get back to how to remedy this in another part of this tutorial.
 - In the 'basicAuth' and 'jwtAuth' functions, the 'done' argument is a function pointer that works somewhat like the resolve function pointer given to Promises. The first argument is an error, and the second is the result. In our cases above, we don't throw any errors, so we always pass null in as the first argument.
 - We require functions to serialize and deserialize users to and from our JWT. In our case, our user object is light enough that we're just using the full user object. If our user objects start to contain more information that we aren't really concerned about in the majority of cases, then we'd use the serializeUser function to construct a lighter object that contains only the subset of important information that we want to save, and then use the deserialize method to either do a database lookup to return the full user if we want, or just return the lighter user object.

We're reading our JWT from cookies, so we'll need to allow express to read cookies using the CookieParser module:
```
npm install --save cookie-parser
```
And in app.js:
```
...
const cookieParser = require('cookie-parser');
...
app.use(cookieParser());
```

To use passport, we also need to call an initialisation method in our app.js (note that the initialised passport object must be given to the app object before our endpoint routing is configured - see the full app.js file for the full setup):
```
...
const passport = require('./passport');
...
app.use(passport.initialize());
...
```

We can now start requiring authentication on our endpoints. We'll start off by using basic HTTP authorization on a new endpoint, by modifying /routes/api.js:
```
const passport = require('../passport');

function routes(app) {
    app.get('/api/test', test);

    app.post('/api/postTest', postTest);

    app.get('/api/authTest', passport.authenticate('basic'), authTest);
}
...
function authTest(req, res) {
    res.status(200).json({
        'success': true,
        'username': req.user.username
    });
}
```
And that's it. The authTest function will only be called if authentication was successful (ie. if the argument supplied to the 'done' function in the authentication strategy was truthy). If so, then the argument passed to the 'done' function (in our case, the full user object) is available on the req object under the key 'user'. As you can see in the example above, this means that we can inspect which user has called our protected endpoints, and we do so by returning the authenticated user's username. Having full access to the user object here will come in handy later on for our protected portions of the frontend.

## Front End

** IMPORTANT - I've changed the layout.html file as of 10/04/2019 to include the latest versions of bootstrap and jquery. I've also done a little refactoring in terms of the setup, so you'll need to copy the latest version of it from this repository if you took your version from this tutorial prior to that day. **

Now that we have an authentication system in place, we can focus on a front end for users. We'll need a login page, and a users page. To start off with, inside our 'views' folder, we'll make 'login.html':
```
{% extends 'layout.html' %}

{% block css %}
    <link rel="stylesheet" href="//localhost:3000/css/style.css">
{% endblock %}

{% block js %}
    <script type="text/javascript" src="//localhost:3000/js/login_client.js"></script>
{% endblock %}

{% block title %}Login Page{% endblock %}

{% block id %}login{% endblock %}

{% block content %}
    <form id="login-form">
        <div class="row form-row justify-content-around">
            <div class="col-12 d-flex justify-content-around">
                <div class="label-and-field d-flex justify-content-between">
                    <label for="username">Username</label>
                    <input id="username" name="username">
                </div>
            </div>
        </div>
        <div class="row form-row justify-content-around">
            <div class="col-12 d-flex justify-content-around">
                <div class="label-and-field d-flex justify-content-between">
                    <label for="password">Password</label>
                    <input id="password" name="password" type="password">
                </div>
            </div>
        </div>
        <div class="row form-row justify-content-around">
            <div class="col-auto">
                <div class="submit d-flex justify-content-between">
                    <input type="submit" id="login-submit" class="btn btn-primary">
                </div>
            </div>
        </div>
    </form>
{% endblock %}
```
Here, we're using the latest version of bootstrap for a quick and easy layout. If you haven't used bootstrap before or would like to know what's going on here, I can write up a simple bootstrap tutorial for you. That said, you'd probably be better off reading their own documentation, which can be found here: https://getbootstrap.com/docs/4.0/getting-started/introduction/
We'll also add the following to our _pages.scss:
```
...
#login {
    #login-form {
        .form-row {
            margin-bottom: 5px;
            &:last-child {
                margin-bottom: 0px;
            }
            .label-and-field {
                min-width: 280px;
                max-width: 300px;
            }
        }
    }
}
```
And the following to our _general.scss:
```
.label-and-field {
    label {
        margin-top: auto;
        margin-bottom: auto;
    }
}
```

With that out of the way, now we want to go ahead and write the javascript that will be responsible for submitting our data to the server. I tend to name my client side js files with a _client suffix, just so that I don't get confused between node files that run on the server and plain javascript files that run inside client browsers. So we'll go ahead and in our /public/js folder, make a file called 'login_client.js':
```
jQuery(document).ready(function($) {
    $('#login-form').submit(formSubmit);

    async function formSubmit(event) {
        event.preventDefault();
        
        var $form = $('#login-form');
        var username = $form.find('#username').val();
        var password = $form.find('#password').val();
        if (!username) {
            alert("A username is required.");
            return;
        }
        if (!password) {
            alert("A password is required.");
            return;
        }

        var data = {
            "username": username,
            "password": password
        };
        $.post(`${document.location.origin}/auth`, data).done(loginCallback).fail(failedLogin);
    }
    
    function loginCallback(response, status) {
        if (status === 'error') {
            alert("An error occurred while attempting to login. Please try again later.");
            return;
        }
        if (status === 'timeout') {
            alert("Login attempt timed out. Please try again later.");
            return;
        }
        if (status !== 'success') {
            alert("An error occurred while attempting to login. Please try again later.");
            return;
        }
    
        if (response.success === true) {
            window.location.href = "../user";
        }
        else if (response.success === false) {
            alert(response.message);
        }
        else {
            alert("An error occurred while attempting to login. Please try again later.");
        }
    }
    
    function failedLogin(xhr, status, error) {
        if (xhr.responseJSON && xhr.responseJSON.message) {
            alert(xhr.responseJSON.message);
        }
        else {
            alert("An error occurred while attempting to log in. Please try again later.");
        }
    }
});
```
Some notes on the above code:
 - You'll notice that I've put the methods inside the on ready function. This is because the '$' alias for jQuery is only available inside of that function. You could definitely define these functions outside the on ready function, but you'd have to replace all of the '$' symbols with the full jQuery alias.
 - We're using jQuery's 'post' method, which allows us to POST to a new '/auth' endpoint (which we'll get to next), and we include our login details as a request body. 
 - Our new endpoint will be setting a cookie with a JWT in it, which we'll be using for authentication. We therefore redirect to the users page upon a successful login attempt, since we'll now be able to authenticate using our cookie.

Since this new '/auth' endpoint isn't really an API endpoint and also definitely isn't a view endpoint, we'll create a new file in our /routes folder for general routes, called 'general.js':
```
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
```
Here, we're writing an authentication function which looks up a user based on the username, and then verifies the password against that user. If either the user lookup doesn't match any users or the password verification fails, we return a message to say that authentication was not successful. Otherwise, we create a JWT with information relating to our user (in this case, just the user ID and an administrator flag) and send that back. The authentication on our front end endpoints will be taking this JWT in as a cookie, so it's useful to include any information here that could potentially be used often so that we don't have to query the database for the full user each time we want to access something, since we don't really have state between pages. The ID is there just in case we need to, though. By using the 'res.cookie' function, browsers will store the JWT as a cookie, with an expiry set to 1 hour (3,600,000ms) from now.

Now that we're using jQuery to post to our server, we'll also need to make sure we allow express to parse url-encoded bodies (I spent far too long trying to figure out why my request bodies were coming through as empty before I stumbled across this one):
```
...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
...
```

And finally, we hook up an endpoint for our login page in '/routes/views.js':
```
function routes(app) {
    app.get('/index', index);

    app.get('/login', login);
}
...
function login(req, res) {
    res.status(200).render('../views/login');
}
```

## User Page and API Key

Nex up is our user page. This will be simple for now, just listing the user's username, and an API key. For starters, we'll need to extend our user model with an API key property, which we'll make a UUID v4 (the same as a .NET GUID). To do this, we'll install the uuid module:
```
npm install --save uuid
```
And then add our property to users.js:
```
const credential = require('credential')();
const uuidv4 = require('uuid/v4');

const user = {
    'id': 1,
    'username': 'tutorial',
    'administrator': true,
    'apiKey': '10ba038e-48da-487b-96e8-8d3b99b6d18a',
}
...
function createAPIKey() {
    return uuidv4();
}

module.exports = {
    'getUserByID': getUserByID,
    'getUserByUsername': getUserByUsername,
    'verifyPassword': verifyPassword,
    'createAPIKey': createAPIKey
};
```
For now, I'm simply hardcoding our user's API key, so that it doesn't change every time we stop and start our server.

For our users page, we'll create a new file in the /views folder called 'user.html':
```
{% extends 'layout.html' %}

{% block title %}User Page{% endblock %}

{% block css %}
    <link rel="stylesheet" href="//localhost:3000/css/style.css">
{% endblock %}

{% block js %}
    <script type="text/javascript" src="//localhost:3000/js/user_client.js"></script>
{% endblock %}

{% block id %}user{% endblock %}

{% block content %}
    <div class="row justify-content-around">
        <div class="col-12 col-sm-10 col-md-9 col-lg-8 col-xl-6">
            <h3>Hello <b>{{ username }}</b></h3>
        </div>
    </div>
    <div class="row justify-content-around">
        <div class="col-12 col-sm-10 col-md-9 col-lg-8 col-xl-6">
            <p>API Key: <b>{{ apiKey }}</b></p>
        </div>
    </div>
    <div class="row justify-content-around">
        <div class="col-auto">
            <button id="logout-button" class="btn btn-primary">Logout</button>
        </div>
    </div>
{% endblock %}
```
Note that we've got some variables here - 'username' and 'apiKey'. These will be defined by our endpoint handler, so that we can customise our page for each individual user.

In '/routes/views.js', we'll add an endpoint for our user page (which will make use of our passport JWT authentication):
```
const passport = require('../passport');

function routes(app) {
    ...
    app.get('/user', passport.authenticate('jwt', { session: false }), user);
}
...
function user(req, res) {
    res.status(200).render('../views/user', {
        username: req.user.username,
        apiKey: req.user.apiKey
    });
}
```

So now that we have a functioning login and user page, we can use a nice little trick to choose a default page depending on whether a user has an active JWT cookie or not. In our '/routes/views.js', we'll add an endpoint for the '/' address, which is our site's root address:
```
...
function routes(app) {
    app.get('/', passport.authenticate('jwt', {
        successRedirect: '/user',
        failureRedirect: '/login'
    }));
    ...
}
...
```
This means that attempting to load our site's root address will now look for our JWT cookie. If it finds one and it authenticates, then it redirects to the user page. If not, it redirects to the login screen, so users can log in.

We'll also want to hook up our logout button on our user page, so we'll create another client-side js file, at '/public/js/user_client.js':
```
jQuery(document).ready(function($) {
    $('#logout-button').click(function() {
        document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = "../";
    });
});
```
Here, we set a click handler on the logout button to set the expiry of our JWT cookie to the unix epoch, since you can't actually delete cookies. This still invalidates our cookie however, so when we redirect to our site root, we'll then be redirected to our login page.

## API Access

But what do we do about some sort of API usage? Users can now see their API key in the user page, so we're now able to create endpoints that require the API key in the authorization header.
```
npm install --save passport-headerapikey
```
Next up, we'll need to create a new strategy in 'passport.js':
```
...
const passportAPI = require('passport-headerapikey');
...
const apiArgs = {
    'header': 'Authorization',
    'prefix': 'Api-Key'
};
...
const api = new passportAPI.HeaderAPIKeyStrategy(apiArgs, false, apiAuth);
...
function apiAuth(apiKey, done) {
    let user = users.getUserByAPIKey(apiKey);
    if (!user) return done(null, false);

    return done(null, user);
}
...
passport.use(api);
...
```
Fairly simple, we're just capturing the API key passed in the authorization header, and then doing a user lookup based on that key, which we'll define in '/sql/users.js':
```
...
function getUserByAPIKey(apiKey) {
    // TODO replace with database lookup
    if (apiKey === user.apiKey) return user;

    return false;
}
...
module.exports = {
    'getUserByID': getUserByID,
    'getUserByUsername': getUserByUsername,
    'getUserByAPIKey': getUserByAPIKey,
    'verifyPassword': verifyPassword,
    'createAPIKey': createAPIKey
};
```
Now, we'll add a test endpoint into '/routes/api.js':
```
...
function routes(app) {
    ...
    app.get('/api/keyTest', passport.authenticate('headerapikey'), keyTest);
}
...
function keyTest(req, res) {
    res.status(200).json({
        'success': true,
        'user': req.user.username
    });
}
...
```
And that's it! To test in Postman, you can GET http://localhost:3000/api/keyTest, and you'll need to manually add a header yourself, with the key 'Authorization' and value 'Api-Key10ba038e-48da-487b-96e8-8d3b99b6d18a' (the module we're using seems to include any space after the 'Api-Key' as part of the api key itself, so we need to make sure there's no space in between).

As a finishing touch for our login system, we'll add a loading spinner so that users know that something is happening when they click the login button. We'll add the spinner element to our base layout so that it's available on all pages, add css to our general sass file to style it, and then add some code to display it when the login page is working. To start off with, we'll add a simple div to the end of '/views/layout.html', and make it hidden by default:
```
...
        <div id="loading-spinner" style="display: none;"></div>
    </body>
</html>
```
Then, we'll style it in '/scss/_general.scss':
```
$blue: #007bff;
$lightGrey: #f3f3f3;
...
#loading-spinner {
    border: 16px solid $lightGrey; /* Light grey */
    border-top: 16px solid $blue; /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    -webkit-animation: spin 1s linear infinite;
    animation: spin 1s linear infinite;
    position: absolute;
    top: calc(50% - 60px);
    left: calc(50% - 60px);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
```
Note the use of variables for colours so that we can use them throughout. The blue we're using here is taken from the default bootstrap colours.
The "spinner" is actually a square, with perfectly rounded corners so that it appears to be a circle. By colouring one of the sides blue and the rest grey, it appears to be a circle with one blue quarter. We simply define a spin animation that rotates in a full circle and apply that to our "circle", and then position it in the centre of the screen and we're done.

Then, we just need to add some code to '/public/js/login_client.js' so that the spinner will show up while we're waiting for a response from the server:
```
jQuery(document).ready(function($) {
    $('#login-form').submit(formSubmit);

    async function formSubmit(event) {
        ...
        $.post(`${document.location.origin}/auth`, data).done(loginCallback).fail(failedLogin);
        $('#loading-spinner').show();
    }
    
    function loginCallback(response, status) {
        $('#loading-spinner').hide();
        ...
    }

    function failedLogin(xhr, status, error) {
        $('#loading-spinner').hide();
        ...
    }
});
```
And now we have a simple loading spinner on our login page whenever we're waiting for a response from the server.

## Configuration

I mentioned earlier that it wasn't a good idea to keep secrets in your source code, but never gave an alternative. At my current job, I was told the story about how a group managed to exploit a vulnerability in the public-facing TeamCity server, to gain access to the source code. Using this, they were able to extract a list of hardcoded secrets and administrator username/password combinations. But how do we get around this? Configuration files are the key.

Storing secrets and other configuration details has multiple benefits - firstly, you don't have to worry about anyone gaining access to things like secrets, database logins, administrator information, etc. and secondly, you can easily set up debug and production environments. We'll do this by having one configuration file per environment that we want to set up, and we won't be checking them with our source control. Instead, we'll keep them one directory above our application's root directory, and refer to them in our code by relative paths. That way, any valuable information can only be discovered by gaining direct access to the server and its file system. It's a bit overkill for something like small projects, but it's always good to conform to best practices. This also lets us have a debug environment that we can set up to point to either localhost or a local IP address for local testing purposes, and a production environment that can point to a public-facing domain.

To do this, we'll be using a module called dotenv:
```
npm install --save dotenv
```
And in the directory ABOVE our application root, we'll create 'development.env':
```
HOST=<LOCAL_IP_HERE>
PORT=3000
CREDENTIAL_SECRET=SECRET
```
And we'll create a copy of the new file in the same directory and call it 'production.env'. Note that the '<LOCAL_IP_HERE>' above should be whatever your local IP is for local debug purposes. Our production environment file can be the same, but feel free to replace the host variable with a public-facing domain name and change the port to whatever you want if you have port-forwarding set up for the machine that will be running the server.

Next up, we'll need to configure Visual Studio Code to pick up on our development environment file whenever we're debugging. To do this, edit your launch.json file (this can be done by pressing ctrl + shift + P, and typing in 'launch.json' to find the right command), and modifying it to look like this:
```
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceFolder}\\app.js",
            "envFile": "${workspaceFolder}\\..\\development.env"
        }
    ]
}
```
The addition we've made here is the last configuration entry: the 'envFile' value. This points Visual Studio Code to where our environment file is, which will be loaded in when we run our app. If you wanted, you could add another configuration that instead targeted the production environment file, so you could choose which environment to debug.

Now, we'll create a configuration module that will read our environment file for use within our application. In our root directory, we'll create 'config.js':
```
const config = {
    "host": process.env.HOST,
    "port": process.env.PORT,
    "credentialSecret": process.env.CREDENTIAL_SECRET
}

module.exports = config;
```
Fairly simple here - our environment variables are available on the process.env object, and we're simply putting them into a single object and exporting it for use within our app.

We'll also need to make this available to Swig since we use our host and port in our HTML. To do this, we need to add the following at the start of our express configuration in 'app.js':
```
...
const config = require('./config');
...
app.locals.config = config;
...
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
...
```
Here, app.locals is a set of objects that will be available in our templating engine, allowing us to make the following change in '/views/layout.html':
```
...
{% set siteRoot = config.host + ":" + config.port %}
...
```
Now, we're reading our host and port configurations from our environment variables and making them available to our templates for links, etc. rather than hardcoding them like we were before. Much better, especially if you don't have static IPs set up on your local network.

The last change that we need to make is replacing our hardcoded secret to use our new config module. In '/passport.js':
```
...
const config = require('./config');
...
const jwtArgs = {
    'jwtFromRequest': cookieExtractor,
    'secretOrKey': config.credentialSecret
}
...
```
And in '/routes/general.js':
```
...
const config = require('../config');
...
let token = jwt.sign({ "id": user.id, "administrator": user.administrator }, config.credentialSecret);
...
```
And that's it! Changing the 'development.env' file should have the changes reflected properly throughout the app. Be careful if you change the secret though, as it will invalidate any JWTs that already exist using the old secret. If you have an active cookie, I recommend going through the logout process to force its expiry and force the creation of a new JWT signed using the new secret upon logging in again.

These environment files can be easily expanded to include other information. For example, if you choose to implement a proper database, you can store the database connection details in the environment files. In fact, I'd highly recommend exploring how to do this yourself as an exercise, so you can replace our single hard-coded user with a proper database of users. You could also choose to create your own user registration page too, if you want to test your understanding of what we've covered in this tutorial.

## Running The App Outside Of Visual Studio Code

So far, we've been debugging our server through Visual Studio Code. To run our app outside of Visual Studio Code, you'll need to run ```node -r dotenv/config app.js dotenv_config_path=../<ENVIRONMENT>.env```, where <ENVIRONMENT> is either 'development' or 'production'.Note that this assumes your terminal is running in the application root directory, otherwise you'll need to specify more specific paths for the 'app.js' and '../<ENVIRONMENT>.env' variables.
In the above command, '-r' is an argument that allows you to 'require' modules directly for use throughout the app, and so '-r dotenv/config' is an argument that essentially replicates 'require('dotenv').config()', which is necessary to load our environment file.

## UPDATE - 02/09/2019: Further exploration of Bootstrap 4 and the grid system, as well as swig and iteration

Though this isn't quite under the scope of the original tutorial, I've included an optional section that explores the Bootstrap grid system, delves a little into CSS's flex styling, and goes through the ability to iterate through JSON objects and arrays using swig. Feel free to skip it if you're not as interested in front-end development, or don't plan on using Bootstrap/swig yourself.

To start off with, I've added some extra objects that we'll pass through to the User view. They're fairly standard, just arrays and objects that we'll be iterating through using swig. The first few objects/arrays are to illustrate the Bootstrap grid system and how it responds to responsive breakpoints, whereas the 'tiles' object will demonstrate a little more of what you can do with the objects being passed through to the templating engine.

In /routes/views.js (adding to the existing 'user' function):
```
...
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
...
```

Now, we can use them in our user view. To do so, we'll be iterating through the new objects and arrays. When iterating through an array, you are given each element of the array in successive iterations. Fairly simple.

In /views/user.html:
```
...
    <div class="row justify-content-around mb-3">
        <div class="col-auto">
            <button id="logout-button" class="btn btn-primary">Logout</button>
        </div>
    </div>
    <div class="row my-3">
        {% for value in simpleArray %}
            <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center"><strong>{{ value }}</strong></div>
        {% endfor %}
    </div>
...
```
The for loop structure itself is fairly self-explanatory, but there's several key things to go through here. The first is the 'my-3' class given to the row. With Bootstrap, you can set margins and padding on elements that are multiples of the pre-defined spacing that it uses, to give elements on your site a consistent feel. Here, there are three components: the 'm' is for margin, the 'y' is for y-axis (top and bottom), and the '3' is for the amount of spacing (this can range from 0-5). You can read more about Bootstrap's spacing system here: https://getbootstrap.com/docs/4.3/utilities/spacing/

Next up, we have a bunch of difference classes on our column div. The first group are column sizes (col-*-*). Bootstrap's grid system allows for up to 12 columns per row, with any extra columns overflowing onto the next line. You can style divs so that they take up multiples of the single-column size, and you can do this dynamically across each of Bootstrap's responsive breakpoints (more on those here: https://getbootstrap.com/docs/4.3/layout/overview/#responsive-breakpoints). So, when you see 'col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12' above, what we're saying is really the following:
- On extra-large devices, the element will be 2 columns wide (1/6 row width)
- On large devices, the element will be 3 columns wide (1/4 row width)
- On medium devices, the element will be 4 columns wide (1/3 row width)
- On small devices, the element will be 6 columns wide (1/2 row width)
- On anything smaller, the element will be 12 columns wide (full row width)
This allows you to easily lay elements out in a grid pattern, without worrying too much about overflow or anything else, as it's all handled for you. I'd encourage you to use your browser's dev-tools to resize the view, so you can see the breakpoints in action and see how the columns flow onto different rows. You should also fiddle around with adding new objects/elements/values to the ones we added to the user route above. You could even open the server up to your local network and access the site from your phone to see how it displays on a true mobile device, if you wanted.

Then, we have the 'd-flex' class. This simply applies 'display: flex;' to the element (if you're not familiar with display: flex, do yourself a favour and check it out. It makes things far, far easier to work with and as of Bootstrap 4.0 is how they make their grid system work). This is handy for our next two classes: 'align-items-center' and 'justify-content-center'. 'align-items-center' applies 'align-items: center;' and aligns children of flex elements perpendicularly to the flex-direction (the default flex-direction is row). What this means is that in this case, 'align-items-center' will vertically centre any child elements, while keeping the child elements all in a row. 'justify-content-center' applies 'justify-content: center;' and horizontally centres all child elements of the element together. Together, they make it very easy to simply centre things both horizontally and vertically together.
It's important to note that flex isn't supported on all browsers (and by that, I mean it's been supported in most browsers since about 2014, and is currently supported by basically everything but IE).


When iterating through an object, you're iterating across each key/value pair that the object holds, rather than purely the values themselves. We can do basically the same thing that we did above, just also specifying the key as part of the loop. In /views/user.html:
```
...
    <div class="row my-3">
        {% for value in simpleArray %}
            <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center"><strong>{{ value }}</strong></div>
        {% endfor %}
    </div>
    <div class="row my-3">
        {% for key, value in simpleObject %}
            <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center"><strong>{{ key }}:</strong>&nbsp;{{ value }}</div>
        {% endfor %}
    </div>
...
```
Nothing too special, just adding in the object key alongside the value in the loop. Using the same Bootstrap features as above, too.

We can combine the two of these concepts to iterate through an array of objects, too. In /views/user.html:
```
...
    <div class="row my-3">
        {% for key, value in simpleObject %}
            <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center"><strong>{{ key }}:</strong>&nbsp;{{ value }}</div>
        {% endfor %}
    </div>
    <div class="row my-3">
        <div class="col-12">
            {% for element in objectArray %}
                <div class="row my-2">
                    {% for key, value in element %}
                        <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center">
                            <strong>{{ key }}:</strong>&nbsp;{{ value }}
                        </div>
                    {% endfor %}
                </div>
            {% endfor %}
        </div>
    </div>
...
```
Here, we iterate through each element of the objectArray variable, which is an object rather than a primitive type. So we can then iterate through the objects themselves, too, to create a child grid. Note that we've chosen to put the child rows inside a full-row column, but technically we could put them inside a smaller column if we want. The overall grid size scales to the size of its container, rather than the full site-width, which means you can even put different grids side-by-side and still divide the child grids into 12 columns each if that's what you're looking for.

In our last example, we iterate through a list of objects, each specifying a colour and height. We use those values in the style of child elements that we place inside columns, creating a grid of boxes that are different sizes and shapes.

In /views/user.html:
```
...
    <div class="row my-3">
        <div class="col-12">
            {% for element in objectArray %}
                <div class="row my-2">
                    {% for key, value in element %}
                        <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center">
                            <strong>{{ key }}:</strong>&nbsp;{{ value }}
                        </div>
                    {% endfor %}
                </div>
            {% endfor %}
        </div>
    </div>
    <div class="row my-3">
        {% for tile in tiles %}
            <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center my-1">
                <div class="tile w-100" style="background-color: {{ tile.colour }}; height: {{tile.height }}px;">

                </div>
            </div>
        {% endfor %}
    </div>
...
```
Still nothing too new here with Bootstrap, with a few additions. We add the 'my-1' class (margin-y-1) to our columns to vertically-separate them by a small amount, which is useful on smaller devices when columns stack on top of each other. We also use the 'w-100' class on the child element we place inside each column, which applies 'width: 100%' to stretch the boxes to be the full width of each column. Without this, since the divs don't have any actual content, they'd just have width: 0 and be invisible. We then apply an inline-style to the child elements, setting their background colours and heights to be the values we passed in through in the route, and that's it!

Note that you could set heights on the child elements (hence the 'tile' class I've applied) using CSS, in accordance with Bootstrap's breakpoints so that you could effectively create a grid of square tiles. You can either hard code your breakpoints manually, looking at Bootstrap's documentation to figure out what they are, or you could get Bootstrap's source SCSS files yourself and import them into your scss so that you can use their pre-defined variables rather than doing them yourself (see https://getbootstrap.com/docs/4.0/getting-started/theming/ for more info on that). I'll leave that as an exercise for you to do, but feel free to ask me any questions you have.

## Thanks For Following Along

That's all for now. Feel free to explore other modules that you could use - for example, there are a number of templating frameworks you could use as an alternative to swig, you could use alternatives to credential for password hashing, there are modules you can use for caching (assuming a real database is involved), and many more.

Let me know if you have any questions or find any issues with the tutorial, as I'm sure I've made mistakes somewhere along the way. Hope it helped!