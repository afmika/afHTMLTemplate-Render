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
		todos : todos_array
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