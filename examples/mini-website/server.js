'use strict';

const express = require('express');
const app = express();
const port = 4200;

const aftemplate = require("aftemplate");
app.use('/assets', express.static('assets'));

app.use(aftemplate.adaptor({
    'header' : "./views/common/header.html",
    'footer' : "./views/common/footer.html",
    'home' : "./views/pages/home.html",
    'about' : "./views/pages/about.html"
}));

app.get('/', async (req, res) => {
	try {
        const eg = res.rendererEngine;
        const partials = [
            eg.setup('header', { title : 'Home' }),
            eg.setup('home'),
            eg.setup('footer', {
                current_year :  1900 + new Date().getYear()
            })
        ];
        /*
        await res.renderPages(partials, {
            'Content-Type': 'text/html'
        }); 
        */
        await res.renderPages(partials);
    } catch(e) {
        console.error( e );
        res.end('Something went wrong...');
    }
});

app.get('/about', async (req, res) => {
	try {
        const eg = res.rendererEngine;
        const partials = [
            eg.setup('header', { title : 'About' }),
            eg.setup('about', { text : 'Text from Server'}),
            eg.setup('footer', {
                current_year : 1900 + new Date().getYear()
            })
        ];
        /*
        await res.renderPages(partials, {
            'Content-Type': 'text/html'
        }); 
        */
        await res.renderPages(partials);
    } catch(e) {
        console.error( e );
        res.end('Something went wrong...');
    }
});

app.listen(process.env.PORT || port, () => console.log(`SERVER IS RUNNING AT ${port}`));