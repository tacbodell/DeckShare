const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const imagePaths = require('./imagePaths');
const { ObjectId } = require('mongodb');
    //  const set = allPrintings.data['OTJ'];
    //  const crab = set.cards.find(x => x.name === 'Explosive Derailment');
    //  const imagePath = constructImagePath(crab);

const app = express();
const PORT = 3005;
let db,
    decksCollection,
    collectionName = 'decks';


    // ignore requests for favicon
app.get('/favicon.ico', (req, res) => res.status(204));
app.set('view engine', 'ejs');
    // set up middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
    // set up middleware to accept json data
app.use(bodyParser.json());
app.use('/css', express.static('public/css'));
app.use('/img', express.static('public/img'));
app.use('/js', express.static('public/js'));

// connect to mongo client
MongoClient.connect('mongodb+srv://coonsbrysona:4aOXjx8otO3xPeRt@deckshare.vxo46rr.mongodb.net/?retryWrites=true&w=majority&appName=DeckShare')
    .then(client => {
        console.log(`Connected to ${collectionName} Database`);
        db = client.db(collectionName);
        decksCollection = db.collection('decks_collection');
    })
    .then(() => {
        // start server
        app.listen(PORT, (req,res) => {
            console.log(`Server live on port ${PORT}`);
        })
    })
    .catch(err => (console.log(err)));

// load homepage
app.get('/', async (req,res) => {
    let allDecks, 
        allDecksImages = [];
    // get all decks from db
    await decksCollection
        .find()
        .toArray()
        .then(data => {
            allDecks = data;
        })
        .catch(err => {console.log(err)});
    // get top card image url for every deck
    allDecks.forEach((el) => {
        const cardImageString = imagePaths[el.cards[0].name];
        allDecksImages.push(cardImageString);
    })
    // render html document
    res.render('index.ejs', { allDecks: allDecks, allDecksImages: allDecksImages })
})

// load page to submit a deck
app.get('/newdeck', async (req,res) => {
    // render html document
    res.render('newdeck.ejs')
})

// load page to view faq
app.get('/faq', async (req,res) => {
    // render html document
    res.render('faq.ejs')
})

// load page to view faq
app.get('/editdeck/:deckid', async (req,res) => {
    const parameter = req.params.deckid;
    // render html document
    res.render('updatedeck.ejs', {deckId: parameter})
})

// load page to view a deck. deck parameter should be the name of the 
app.get('/viewdeck/:deckid', async (req,res) => {
    const parameter = req.params.deckid;
    let deckToView, cardImages = [];
    // get deck from db
    await decksCollection
        .findOne({"_id": new ObjectId(parameter)})
        .then(data => {
            deckToView = data;
        })
        .catch(err => {console.log(err)});
    // get array of every card's image
    deckToView.cards.forEach((el) => {
        const cardImageString = imagePaths[el.name];
        cardImages.push(cardImageString);
    })
    //render page with deck
    res.render('deck.ejs', { deck: deckToView, images: cardImages });
})

// post request to add new deck
app.post('/deck', (req,res) => {
    if (req.body.deckAuthor == '' || req.body.cardString == '' || req.body.deckName == ''){
        console.log('All fields must be filled correctly.');
        res.json('Error: All fields must be filled correctly.');
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

//handle deck updates
app.put('/deck', (req, res) => {
    const cardString = req.body.cardString
    const deck = parseCardStringToArrayOfObjects(cardString)
    const id = req.body.id
    console.log(cardString)
    decksCollection
        .findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: {
                    cards: deck
                },
            },
            {
                upsert: false,
            }
        )
        .then(result => res.json('Success'))
        .catch(error => console.error(error));
});

//delete request to delete one deck
app.delete('/deck', (req, res) => {
    decksCollection
        .deleteOne({ "_id": new ObjectId(req.body.id) })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.json('No object to delete found');
            }
            res.json(`Deck with id ${req.body.id} deleted.`);
        })
        .catch(error => console.error(error));
})

    // accepts a cardstring from archidekt, and returns an array of card objects, in the format used in decks databases
function parseCardStringToArrayOfObjects(str){
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

        // parse for name
        const parStartIndex = cardString.indexOf('(');
        const cardName = cardString.slice(0, parStartIndex - 1);

        // remove name from card area
        cardString = cardString.split('(');
        cardString.shift();
        cardString = cardString.join('(');

        // parse for set code
        const parEndIndex = cardString.indexOf(')');
        const setCode = cardString.slice(0, parEndIndex);

        // remove set code from card area
        cardString = cardString.split('\n');
        cardString.shift();
        cardString = cardString.join('\n');

        // push new card object to array
        arr.push({
            'name': cardName,
            'amount': cardAmount,
            'setCode': setCode,
        })
    }
    return arr;
}