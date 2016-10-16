var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/scoreboard';

/*var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('score');
  // Insert some documents
  collection.insertMany([
    {teamOne : 0}, {teamTwo : 0}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(2, result.result.n);
    assert.equal(2, result.ops.length);
    console.log("Inserted 2 documents into the collection");
    callback(result);
  });
}*/

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
        if(docs.name){
          var temp = {
            name: docs.name,
            score: docs.score
          };
          scores.push(temp);
        }else{
        scores.push(docs);  
        }

        callback(docs);
    });
    return scores;
}

// Use connect method to connect to the server
/*MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to MongoDB server");

  insertDocuments(db, function() {
     db.close();
   });

});*/

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

var aWss = expressWs.getWss('/a');


app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
        var teamOne = JSON.parse(msg).teamOne;
        var teamTwo = JSON.parse(msg).teamTwo;
        console.log(teamOne);
        console.log(teamTwo);
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected successfully to MongoDB server");

             updateScore(db, function() {
            }, teamOne);
            updateScore(db, function() {
               db.close();
           }, teamTwo);

        });
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
