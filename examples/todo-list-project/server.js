'use strict';

const express = require('express');
const app = express();
const port = 4200;

const aftemplate = require("aftemplate");

let todos_array = [];

app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(aftemplate.adaptor({
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
        res.end('Something wrong happened :(');
    }
});

app.get('/add', (req, res) => {
	todos_array.push({ 
		id : todos_array.length + 1 , 
		content : req.query.todo
	});
	res.redirect('/');
});