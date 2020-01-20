# af-HTML-Template-Render
A simple tool to dynamically display HTML template pages using Javascript/nodejs

# Example 1 : Single page rendering
```javascript

'use strict';
const express = require('express');
const afTemplate = require("aftemplate");

const app = express();
const engine = new afTemplate();

app.get('/', (req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'text/html' 
    });
	
    engine.render(res, "./path/to/mypage.html", {
        app_title : "Example",
		names : ['Marc', 'John', 'Diana']
    })
	.then(page => {
        console.log(page.path, "RENDERED");
        res.end('');
    })
	.catch(err => {
        console.log( err );
        res.end( err.toString() );
    });
});
```
mypage.html

```
<h1> {{ app_title }} </h1>
<div>
	<% names.forEach(name => { %>
		<ol> <%= name %> </ol>
	<% }); %>
</div>
```

# Example 2 : Multiple page rendering

```javascript
'use strict';
const express = require('express');
const afTemplate = require("aftemplate");

const app = express();
const engine = new afTemplate();

app.get('/', (req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'text/html' 
    });
	const partials = [
		{
			path: "./path/to/head.html",
			argument: { message : "Hello from head.html" }
		},
		{
			path: "./path/to/body.html",
			argument: { 
				message1 : "Hello from body.html", 
				message2 : "It works!",
				time_info : new Date().toJSON()
			}
		},
		{
			path: "./path/to/foot.html",
			argument: { message : "Hello from foot.html" }
		}
	];
	
    engine.renderPages(res, partials)
	.then(pages => {
		for(let p in pages)
			console.log(pages[p].path, " RENDERED");
        res.end("");
    })
	.catch(err => {
        console.log( err );
        res.end( err.toString() );
    });
});
```

head.html
```
	<h1> {{ message }}</h1>
```

body.html
```
	<h2> {{ message1 }} . {{ message2 }}</h2>
	<h2> Date : {{ time_info }} </h2>
```
foot.html
```
	<h2> {{ message }}</h2>
```


You can also include files directly from your html template
example.html
```
	<% include_once("./path/to/menu.html"); %>
	<% include("./path/to/index.html"); %>
	<% include("./path/to/foot.html"); %>
```

# TODO-LIST Project

server.js
```javascript
'use strict';

const express = require('express');
const afTemplate = require("aftemplate");

const app = express();
const engine = new afTemplate();
const port = 4200;

let todos_array = [];

app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'text/html' 
    });
	
    engine.render(res, "./views/index.html", {
        app_title : "Todo list project",
		todos : todos_array,
    })
	.then(page => {
        console.log(page.path, "RENDERED");
        res.end('');
    })
	.catch(err => {
        console.log( err );
        res.end( err.toString() );
    });
});

app.get('/add', (req, res) => {
	todos_array.push( req.query.todo );
	res.redirect('/');
});
```
index.html
```
<!DOCTYPE html>
 <html>
    <head>
        <title>TODO LIST</title>
    </head>
    <body>        
        <h3>
           {{ app_title }}
        </h3>
		
		<img src="assets/logo.png"/>
		
		<form method="get" action="add">
			<input type="text" name="todo" value="" size="25">
			<button>add</button>
		</form>
		
        <div>
			<% if( todos.length == 0) { %>
				<h3> No todos yet...</h3>
			<% } %>
			
			<% todos.forEach(todo => {   %>
				<ol type="a"> <%= todo %> </ol>
			<% }); %>
        </div>

    </body>
</html>
```
