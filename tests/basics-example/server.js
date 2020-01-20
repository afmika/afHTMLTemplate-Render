'use strict';

const express = require('express');
const app = express();
const port = 4200;

const afTemplate = require("../../index");
const engine = new afTemplate();

app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	// console.log(next);
    next();
});

app.use('/assets', express.static('public'));

app.get('/', (req, res) => {

    res.writeHead(200, { 
        'Content-Type': 'text/html' 
    });
	
	const time = new Date();
	
	const argument = {
        message : "HELLO WORD",
        hours : time.getHours(),
		minutes : time.getMinutes(),
		seconds : time.getSeconds()
    };
	
    engine.render(res, "./views/test.html", argument)
	.then(page => {
        console.log(page.path, " RENDERED");
        res.end("");
    })
	.catch(err => {
        console.log( err );
        res.end( err.toString() );
    });
	
});

app.get('/multiple', (req, res) => {

    res.writeHead(200, { 
        'Content-Type': 'text/html' 
    });
	
	const partials = [
        {
            path: "./views/partials/head.html",
            argument: { message : "Hello from head.html" }
        },
        {
            path: "./views/partials/body.html",
            argument: { 
				message1 : "Hello from body.html", 
				message2 : "It works!",
				message3 : "Hello from test_include.html",
				message4 : "Hello from test_include_once.html",
			}
        },
        {
            path: "./views/partials/foot.html",
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