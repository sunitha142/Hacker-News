const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
//connecting to Databas
mongoose.connect('mongodb://localhost/nodeData');
let db = mongoose.connection;

// Check connection
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err) {
    console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Home Route
app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});
//give  single  article
app.get('/article/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (err) {
            console.log(err)
        }
        res.render('article', {
            article: article
        });
    });
});
//Add Route
app.get('/articles/add', function(req, res) {
    res.render('add_articles', {
        title: 'Add Article'
    });
});
//Add Submit Route
app.post('/articles/add', function(req, res) {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    article.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success', 'Article Added');
            res.redirect('/');
        }
    });
});

//Load Edit form
app.get('/article/edit/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (err) {
            console.log(err)
        }
        res.render('edit_article', {
            title: ' Edit Title',
            article: article
        });
    });
});

//Add Update Route
app.post('/articles/edit/:id', function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id };
    Article.update(query, article, function(err) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

//Delete Route
app.delete('/article/:id', function(req, res) {
    let query = { _id: req.params.id }
    Article.remove(query, function(err) {
        if (err) {
            console.log(err);
        }
        res.send('Success');
    });
});


// Start Server
app.listen(3000);
console.log('Server started on port 3000...');