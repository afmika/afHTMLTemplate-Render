'use strict';

const express = require('express');
const app = express();
const port = 4200;

const afTemplate = require("../../index");
const engine = new afTemplate();
engine.setAlias({
    'head' : "./views/partials/head.html",
    'body' : "./views/partials/body.html",
    'foot' : "./views/partials/foot.html",
});


app.get('/', (req, res) => {
	const partials = [
        // traditionnal way + using alias
        {
            path: engine.path('head'),
            argument: { message : "Hello from head.html" }
        },

        // new way + using alias
        engine.setup('body', {
            message1 : "Hello from body.html", 
            message2 : "It works!",
            message3 : "Hello from test_include.html",
            message4 : "Hello from test_include_once.html"
        }),
        engine.setup('foot', {
            message : "Hello from foot.html"
        })
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


app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));