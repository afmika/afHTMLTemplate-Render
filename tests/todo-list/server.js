'use strict';

const express = require('express');
const app = express();
const port = 4200;

const afTemplate = require("../../index");
const engine = new afTemplate();

let todos_array = [];

app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.get('/', (req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'text/html' 
    });
	
    engine.render(res, "./views/index.html", {
        app_title : "Test todo list",
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
	todos_array.push({ 
		id : todos_array.length + 1 , 
		content : req.query.todo
	});
	res.redirect('/');
});