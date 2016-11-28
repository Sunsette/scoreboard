var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var spotify = require('spotify-node-applescript');

// Connection URL
var url = 'mongodb://localhost:27017/scoreboard';

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(function(req, res, next) {
    console.log('middleware');
    console.log("Origin: ");
    console.log(req.body);
    req.testing = 'testing';
    return next();
});

app.use('/', express.static('app'));

app.get('/', function(req, res, next) {
    console.log('get route', req.testing);
    res.end();
});

var findDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        callback(docs);
    });
}

var findScores = function(db, callback) {
    var collection = db.collection('score');
    // Find some documents
    var scores = [];
    collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        if (docs.name) {
            var temp = {
                name: docs.name,
                score: docs.score
            };
            scores.push(temp);
        } else {
            scores.push(docs);
        }

        callback(docs);
    });
    return scores;
}

var updateTeamName = function(db, callback, team) {
    var collection = db.collection('score');

    collection.updateOne({
        'name': team.oldName
    }, {
        $set: {
            'name': team.newName
        }
    }, function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log('Changed team name from [' + team.oldName + '] to [' + team.newName + ']');
    });
}

var updateScore = function(db, callback, team) {
    var collection = db.collection('score');
    // Find some documents
    var scores = [];
    collection.updateOne({
        'name': team.name
    }, {
        $set: {
            'score': team.score
        }
    }, function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Updated the document with the field a equal to 2");
        callback(result);
    });
};

app.get('/context', function(req, res, next) {
    console.log('YO YO YO');
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to MongoDB server");

        var scores = findScores(db, function() {
            db.close();

            console.log(scores);

            res.send(scores);
            res.end();
        });

    });
});

app.put('/score', function(req, res, next) {

    var team = {
        name: req.query.name,
        score: req.query.score
    };

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to MongoDB server");
        console.log(team);
        console.log(req);
        var scores = updateScore(db, function() {
            db.close();

            console.log(scores);

            res.send(scores);
            res.end();
        }, team);

    });
});

app.put('/team/name', function(req, res, next) {
    var team = {
        oldName: req.query.oldName,
        newName: req.query.newName
    };

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to MongoDB server");
        console.log(team);
        console.log(req);
        updateTeamName(db, function() {
            db.close();
            res.end();
        }, team);

    });

});

var aWss = expressWs.getWss('/a');


app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
        var teamOne = JSON.parse(msg).teamOne;
        var teamTwo = JSON.parse(msg).teamTwo;
        console.log(teamOne);
        console.log(teamTwo);
        if (teamOne !== undefined) {

            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                console.log("Connected successfully to MongoDB server");

                updateScore(db, function() {}, teamOne);
                updateScore(db, function() {
                    db.close();
                }, teamTwo);

            });
        } else {

            spotify.getState(function(err, state) {
                /*
                state = {
                    volume: 99,
                    position: 232,
                    state: 'playing'
                }
                */

                if (state.state === "playing") {
                    spotify.playPause(function() {
                        console.log("Toggled Spotify");
                    });
                }
            });
        }
        aWss.clients.forEach(function(client) {
            client.send(msg);
        });
        //ws.send(msg);
    });
    console.log('socket', req.testing);
});

app.listen(3030, function() {
    console.log("Listening on port 3030");
});
