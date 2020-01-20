# af-HTML-Template-Render
A simple tool to dynamically display HTML template pages using Javascript/nodejs

# Example : render a single page

'use strict';
const express = require('express');
const app = express();
const afTemplate = require("aftemplate");
const engine = new afTemplate();

// basics
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

# mypage.html

<h1> {{ app_title }} </h1>
<div>
	<% names.forEach(name => { %>
		<ol> <%= name %> </ol>
	<% }); %>
</div>