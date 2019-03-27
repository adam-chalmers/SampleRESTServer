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
 
Since we previously configured the api module to export the routes function, and we've configured our postTest endpoint inside the routes function, we don't need to changeanything more in our app.js file to be able to access our new endpoint. Since we've configured this new endpoint to use the POST method, we won't be able to use a browser totest it. Install Postman, and POST to http://localhost:3000/api/postTest with an empty body and you should get the 400 status back, with our failure message as before. This is because we didn't supply a message. Add a message to the body, and you should get the 200 status back, with our success message that displays what the input message in the body was.

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

We'll start with a base layout template, called layout.html:
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>{{ title }}</title>
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
    </head>
    <body>
        {% block content %}
        {% endblock %}
        <script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    </body>
</html>
```
The above template defines a head that contains the title and a link to bootstrap css, and a body that uses jQuery and bootstrap js, plus a block. The block is where the templating magic happens, as we'll see below in a file called index.html:
```
{% extends 'layout.html' %}

{% block title %}{% endblock %}

{% block content %}
    <div class="container">
        <h1>{{ title }}</h1>
        <p>Welcome to {{ title }}</p>
    </div>
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
    res.status(200).render('../views/index', { title: 'Index Page' });
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
<link rel="stylesheet" href="//localhost:3000/css/style.css">
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
<script type="text/javascript" src="//localhost:3000/js/index.js"></script>
```
Then when you reload the server and the page, you should see an alert pop up when you load the index page.

Of course, we didn't have to add these to the base layout. We could've just as easily added them to the index.html page instead, if we make a couple tweaks to our base layout:
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>{{ title }}</title>
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        {% block css %}
        {% endblock %}
    </head>
    <body>
        {% block content %}
        {% endblock %}
        <script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        {% block js %}
        {% endblock %}
    </body>
</html>
```
This then allows us to specify our own css and js per page in the page templates themselves:
```
{% extends 'layout.html' %}

{% block title %}{% endblock %}

{% block css %}
    <link rel="stylesheet" href="//localhost:3000/css/style.css">
{% endblock %}

{% block js %}
    <script type="text/javascript" src="//localhost:3000/js/index.js"></script>
{% endblock %}

{% block content %}
    <div class="container">
        <h1>{{ title }}</h1>
        <p>Welcome to {{ title }}</p>
    </div>
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
Now, every time a scss file is modified in the watch directory (./scss), our sass is compiled into the output directory. This means we can make modifications to our scss files and simply refresh our pages to see the changes come through immediately.
We run this in a second terminal, since we may still want to use our first one for npm or other commands, and as long as the node-sass command is running, the terminal is unuseable. Note also that this watch command will need to be run every time vscode is started.