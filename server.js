const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
 const allPrintings = require('./AllPrintings.json');
    const set = allPrintings.data['OTJ'];
    const crab = set.cards.find(x => x.name === 'Explosive Derailment');

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
        console.log('Connected to Decks Database');
        const db = client.db('decks');
        const decksCollection = db.collection('decks_collection');

        app.get('/', async (req,res) => {
            const image = constructImagePath(crab);
            decksCollection
                .find()
                .toArray()
                .then(data => {
                    res.render('index.ejs', { decks: data, cardImage: image });
                })
                .catch(err => {console.log(err)});
        })

        app.post('/deck', (req,res) => {
            if (req.body.deckAuthor === '' || req.body.cardString === '' || req.body.deckName === ''){
                console.log('All fields must be filled.');
            } else {
                const deck = parseCardStringToArrayOfObjects(req.body.cardString);
                decksCollection
                    .insertOne({
                        'deckAuthor': req.body.deckAuthor,
                        'deckName': req.body.deckName,
                        'cards': deck,
                    })
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

    function constructImagePath(c) {
        const fileFace = 'front';
        const fileType = 'large';
        const fileFormat = 'jpg';
        const fileName = c.identifiers.scryfallId;
        const dir1 = fileName.charAt(0);
        const dir2 = fileName.charAt(1);
        const thang = `https://cards.scryfall.io/${fileType}/${fileFace}/${dir1}/${dir2}/${fileName}.${fileFormat}`;
        return thang;
    }

    // takes a cardstring from archidekt, and returns an array of card objects, in the format used in decks databases
    function parseCardStringToArrayOfObjects(str){
        console.log(`str passed to parse function: ${str}`)
        let cardString = str;
        let arr = []
        while(cardString){
            // parse for amount
            const xIndex = cardString.indexOf('x');
            const cardAmount = Number(cardString.slice(0, xIndex));

            // remove amount from card area
            cardString = cardString.split(' ');
            cardString.shift();
            cardString = cardString.join(' ');

            console.log(`cardString after parsing for amount: ${cardString}`);

            // parse for name
            const parStartIndex = cardString.indexOf('(');
            const cardName = cardString.slice(0, parStartIndex - 1);

            // remove name from card area
            cardString = cardString.split('(');
            cardString.shift();
            cardString = cardString.join('(');

            console.log(`cardString after parsing for name: ${cardString}`);

            // parse for set code
            const parEndIndex = cardString.indexOf(')');
            const setCode = cardString.slice(0, parEndIndex);

            // remove set code from card area
            cardString = cardString.split(' ');
            cardString.shift();
            cardString = cardString.join(' ');

            console.log(`cardString after parsing for code: ${cardString}`);

            // push new card object to array
            arr.push({
                'name': cardName,
                'amount': cardAmount,
                'setCode': setCode,
            })

            console.log(`array after pushing new object: ${arr}`);
        }
        console.log(`cardString after loop ended: ${cardString}`)
        console.log(`final array: ${JSON.stringify(arr)}`);
        return arr;
    }