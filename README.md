# aftemplate.js

A simple tool to dynamically display HTML template pages using nodejs, Javascript and express.js


## Features
* Lightweight
* Uses 100% javascript as template programming language
* Easy to configure with your preferred view architecture
* Can render any type of template text file and not just html (json, xml, ...) by setting the correct header
* Template alias system
* Write less, do more


## Example 1 : Single page rendering
```javascript

'use strict';
const express = require('express');
const aftemplate = require("aftemplate");

const app = express();
app.use(aftemplate.adaptor());

app.get('/', async (req, res) => {
	try {
		// the default Content-Type header is set to text/html
		await res.render("./path/to/mypage.html", {
			app_title : "Example 1",
			names : ['Marc', 'John', 'Diana']
		});
	} catch(err) {
		console.error(err);
		res.end('Something went wrong');
	}
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

## Example 2 : Multiple page rendering
### Using the new alias system
<div>
(You can check out this example project which features the new alias system  <a href="https://github.com/afmika/afHTMLTemplate-Render/tree/master/examples/mini-website"><b>HERE</b></a> )
</div>

```javascript
'use strict';
const express = require('express');
const aftemplate = require('aftemplate');

const app = express();
app.use(aftemplate.adaptor({
	// aliases
    'header' : './path/to/head.html',
    'body' : './path/to/body.html',
    'footer': './path/to/foot.html'
}));

app.get('/', async (req, res) => {
	try {
		const eg = res.rendererEngine;
		const partials = [
			eg.setup('header', { message : "Hello from head.html" }),
			eg.setup('body', { 
				message1 : "Hello from body.html", 
				message2 : "It works!",
				time_info : new Date().toJSON()
			}),
			eg.setup('footer', { message : "Hello from foot.html" })
		];
		// the default Content-Type header is set to text/html
		await res.renderPages(partials);
	} catch(err) {
		console.log( err );
		res.end('Something went wrong');
	}
});
```
Or ...
### Using template files directly
```javascript
'use strict';
const express = require('express');
const aftemplate = require('aftemplate');

const app = express();
app.use(aftemplate.adaptor());

app.get('/', async (req, res) => {
	try {
		const partials = [
			{
				path: './path/to/head.html',
				argument: { message : 'Hello from head.html' }
			},
			{
				path: './path/to/body.html',
				argument: { 
					message1 : 'Hello from body.html', 
					message2 : 'It works!',
					time_info : new Date().toJSON()
				}
			},
			{
				path: './path/to/foot.html',
				argument: { message : 'Hello from foot.html' }
			}
		];
		
		await res.renderPages(partials);
	} catch (err) {
		console.log( err );
		res.end('Something went wrong');
	}
});
```
### Templates used
head.html
```
	<h1> {{ message }} </h1>
```

body.html
```
	<h2> 
                <i>
                  {{ message1 }}
                </i> 
           {{ message2 }}
        </h2>
	<h2> Date : {{ time_info }} </h2>
```
foot.html
```
	<h2> {{ message }}</h2>
```


You can also include files directly from your html template <br/>
example.html
```
	<div>
		<% include_once("./path/to/menu.html"); %>
	</div>
	<div>
		<% include("./path/to/content.html"); %>	
	</div>
	<div>
		<% include("./path/to/foot.html"); %>
	</div>
```
## Example 3 : TODO-LIST project

<div>
	( Source code <a href="https://github.com/afmika/afHTMLTemplate-Render/tree/master/examples/todo-list-project"><b>HERE</b></a>  )
</div>

./server.js
```javascript
'use strict';

const express = require('express');
const app = express();
const port = 4200;

const afTemplate = require("afTemplate");

let todos_array = [];

app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(afTemplate.adaptor({
	'home' : './views/index.html'
}));


app.get('/', async (req, res) => {
    const eg = res.rendererEngine;
    try {
        await res.render(eg.path('home'), {
            app_title : "Test todo list",
            todos : todos_array,
        });
    } catch(e) {
        console.error(e);
        res.end('Something went wrong');
    }
});

app.get('/add', (req, res) => {
	todos_array.push({ 
		id : todos_array.length + 1 , 
		content : req.query.todo
	});
	res.redirect('/');
});
```
./views/index.html
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
	
		<form method="get" action="add">
			<input type="text" name="todo" value="" size="25">
			<button>add</button>
		</form>
		
        <div>
			<% if( todos.length == 0) { %>
				<h3> No todos yet...</h3>
			<% } %>
			
			<% todos.forEach(todo => {   %>
				<ol type="a"> <%= todo.id %> - <%= todo.content %></ol>
			<% }); %>
        </div>
    </body>
</html>
```
