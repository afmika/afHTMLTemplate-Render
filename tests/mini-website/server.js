'use strict';

const express = require('express');
const app = express();
const port = 4200;

const afTemplate = require("../../index");
const engine = new afTemplate();

app.use('/assets', express.static('assets'));

engine.setAlias({
    'header' : "./views/common/header.html",
    'footer' : "./views/common/footer.html",
	
    'home' : "./views/pages/home.html",
    'about' : "./views/pages/about.html"
});

app.get('/', (req, res) => {
	const partials = [
		engine.setup('header', { title : 'Home' }),
        engine.setup('home'),
		engine.setup('footer', {
			current_year :  1900 + new Date().getYear()
		})
    ];
	
    engine.renderPages(res, partials)
	.then(pages => {
		for(let p in pages)
			console.log(pages[p].path, " RENDERED");
        res.end();
    })
	.catch(err => {
        console.log( err );
        res.end( err.toString() );
    });
});

app.get('/about', (req, res) => {
	
	const partials = [
		engine.setup('header', { title : 'About' }),
        engine.setup('about', { text : 'Text from Server'}),
		engine.setup('footer', {
			current_year : 1900 + new Date().getYear()
		})
    ];
	
    engine.renderPages(res, partials)
	.then(pages => {
		for(let p in pages)
			console.log(pages[p].path, " RENDERED");
        res.end();
    })
	.catch(err => {
        console.log( err );
        res.end( err.toString() );
    });
});

app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));