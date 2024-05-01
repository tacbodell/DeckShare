const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const PORT = 3005;

    // ignore requests for favicon
app.get('/favicon.ico', (req, res) => res.status(204));
app.set('view engine', 'ejs');
    // set up middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
    // set up middleware to accept json data
app.use(bodyParser.json());
app.use(express.static('public/css'));
app.use(express.static('public/img'));
app.use(express.static('public/js'));

// connect to mongo client
MongoClient.connect('mongodb+srv://coonsbrysona:4aOXjx8otO3xPeRt@deckshare.vxo46rr.mongodb.net/?retryWrites=true&w=majority&appName=DeckShare')
    .then(client => {
        console.log('Connected to Database');
        const db = client.db('decks');
        const decksCollection = db.collection('decks_collection');

        app.get('/', (req,res) => {
            decksCollection
                .find()
                .toArray()
                .then(data => {
                    console.log(`data fetch complete. data found: ${data}`);
                    res.render('index.ejs', { decks: data });
                })
                .catch(err => {console.log(err)});
        })

        app.post('/deck', (req,res) => {
            if (req.body.name === '' || req.body.cardName1 === ''){
                console.log('Card name or author must not be empty');
                res.redirect('/');
            } else {
                decksCollection
                    .insertOne(req.body)
                    .then(result => {
                        console.log(result);
                        res.redirect('/');
                    })
                    .catch(err => console.error(err));
            }
        });

        app.listen(PORT, (req,res) => {
            console.log(`Server live on port ${PORT}`);
        })
    })
    .catch(err => (console.log(err)));