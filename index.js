const express = require("express"),
                app = express(),
                bodyParser = require('body-parser'),
                fs = require('fs'),
                cors = require('cors'),
                admin = require('firebase-admin');
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const serviceAccount = require(__dirname + '/creds.json') //remove credentials from public github
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "http://localhost:3000" //process.env.databaseurl
});
var db = admin.database();

app.get("/", (req, res) => {
    res.send('Got main')
});

app.get('/songs/:song', (req, res) => {
    const song = req.params.song;

    fs.readFile(__dirname + "/music/" + song + ".mp3", function(err, result) { //remove songs from public github
        res.json(result.toString("base64"));
    });
})

app.get('/leaderboard', (req, res) => {
    const ref = db.ref('/');
    ref.once('value', (refscore) => {
        res.json({scoreData: refscore.val()})
    })
})

app.post('/leaderboard', (req, res) => {
    const score = req.body.score;
    const song = req.body.song;
    const ref = db.ref('/' + song);

    ref.once('value', (refScore) => {
        if (score > refScore.val()) {
            ref.set(score);
            res.json({score, newScore: true})
        } else {
            res.json({score: refScore.val(), newScore: false})
        }
    }, (errorObject) => {
        res.json('The read failed: ' + errorObject.name);
    }); 
})

app.listen(process.env.PORT || 3000, process.env.IP, ()=> {
    console.log('Server running ' + process.env.PORT)
  })
  