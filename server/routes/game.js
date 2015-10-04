var mongo = require('mongodb');

var MongoServer = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var DatabaseServer = new MongoServer('localhost', 27017, {auto_reconnect: true});
db = new Db('gamedb', DatabaseServer);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'gamedb' database");
        db.collection('beacons', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'beacons' collection doesn't exist. Creating it with sample data...");
                populateBeaconsCollectionInDB();
            }
        });
        db.collection('players', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'players' collection doesn't exist. Creating it with sample data...");
                populatePlayersCollectionInDB();
            }
        });
        db.collection('assignments', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'assignments' collection doesn't exist. Creating it with sample data...");
                populateAssignmentsCollectionInDB();
            }
        });
    }
});



exports.isRegistered = function(req, res) {
    res.send({"MAGIC_COOKIE":req.params.magic_cookie});
};


exports.register = function(req, res) {

	    var cookie = req.body;
	    console.log('Adding player with cookie: ' + JSON.stringify(cookie));
	    var player = {	     
	    		MAGIC_COOKIE: cookie,
	   	     handle: "Unhandled",
		     kills: 0,
		     deaths: 0}
	    db.collection('players', function(err, collection) {
	        collection.insert(player, {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred'});
	            } else {
	                console.log('Success: ' + JSON.stringify(result[0]));
	                res.send(result[0]);
	            }
	        });
	    });
	
	
	
    res.send({"register":req.params.magic_cookie});
};

exports.setHandle = function(req, res) {
    res.send({"setHandle":req.params.magic_cookie});
};

exports.getBeacon = function(req, res) {
    res.send({"getBeacon":req.params.magic_cookie});
};

exports.getTarget = function(req, res) {
    res.send({"getTarget":req.params.magic_cookie});
};
exports.informKill = function(req, res) {
    res.send({"informKill":req.params.magic_cookie});
};
exports.getGameStats = function(req, res) {
    res.send({"getGameStats":"stat me daddyo"});
};
exports.getPlayerStats = function(req, res) {
    res.send({"getPlayerStats":req.params.magic_cookie});
};


/*--------------------------------------------------------------------------------------------------------------------*/
// Helper functions
exports.listBeacons = function(req, res) {
    db.collection('beacons', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.listPlayers = function(req, res) {
    db.collection('players', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with initial data 

var populateBeaconsCollectionInDB = function() {

 var beacons = [
 {
     UUID: "DEADDEAD-DEAD-DEAD-DEAD-D1ED1ED1ED1E",
     major: "1",
     minor: "1",
     color: "purple",
     notes: "Dog sticker"
 },
 {
     UUID: "DEADDEAD-DEAD-DEAD-DEAD-D1ED1ED1ED1E",
     major: "1",
     minor: "2",
     color: "blue",
     notes: "Cat sticker"
 },
 {
     UUID: "DEADDEAD-DEAD-DEAD-DEAD-D1ED1ED1ED1E",
     major: "1",
     minor: "3",
     color: "green",
     notes: "Budgie sticker"
 }];

 
 db.collection('beacons', function(err, collection) {
     collection.insert(beacons, {safe:true}, function(err, result) {});
 });
};

var populatePlayersCollectionInDB = function() {

	 var players = [
	 {
	     MAGIC_COOKIE: 1,
	     handle: "Amit",
	     kills: 0,
	     deaths: 0
	 },
	 {
		 MAGIC_COOKIE: 2,
	     handle: "Sam",
	     kills: 0,
	     deaths: 0
	 },
	 {
		 MAGIC_COOKIE: 3,
	     handle: "Rod",
	     kills: 0,
	     deaths: 0
	 }];

	 
	 db.collection('players', function(err, collection) {
	     collection.insert(players, {safe:true}, function(err, result) {});
	 });
	};
	
	var populateAssignmentsCollectionInDB = function() {

		 var assignments = [
		 {
		     player: "1",
		     beacon: "1",
		     target: "2"
		 },
		 {
		     player: "2",
		     beacon: "2",
		     target: "3"
		 },
		 {
		     player: "3",
		     beacon: "3",
		     target: "1"
		 }];

		 
		 db.collection('assignments', function(err, collection) {
		     collection.insert(assignments, {safe:true}, function(err, result) {});
		 });
		};
