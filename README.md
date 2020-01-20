# af-HTML-Template-Render
A simple tool to dynamically display HTML template pages using Javascript/nodejs

# Example 1 : render a single page
```javascript

'use strict';
const express = require('express');
const app = express();
const afTemplate = require("aftemplate");
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

# Example 2 : render more than one page

```javascript
'use strict';
const express = require('express');
const app = express();
const afTemplate = require("aftemplate");
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
	<h2> Date : {{ time_info }}</h2>
```
foot.html
```
	<h2> {{ message }}</h2>
```

```
You can also include files directly from your html template
```
example.html
```
	<% include_once("./path/to/menu.html"); %>
	<% include("./path/to/index.html"); %>
	<% include("./path/to/foot.html"); %>
```