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

## Tutorial

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
But that'll need to be done for every single endpoint we want to configure, which will end up making a very big file. So here's where we can make our own modules. Create a folder named routes, and a file under this folder named api.js. This is where we'll configure our API endpoints.

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
This configures the api module to export the routes function. Back in app.js, we can write
```
const api = require('./routes/api');
```
This then makes the routes function available to our app.js entry point, and all we need to do now is write
```
api(app);
```
And our application will pass the express server instance into the api.routes() function, where it will configure all the endpoints we set up in said function. In this way, you can separate your endpoints out into modules, based on their functionality. You can make these modules more granular if you wish, such as having an api folder instead of an api module, with multiple modules under that folder separated based on functionality. Later on, we'll add a views module which will allow us to configure endpoints that respond with HTML for a frontend to our application.

Start your application, and if you go to http://localhost:3000/api/test, you should see the JSON response configured above.

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