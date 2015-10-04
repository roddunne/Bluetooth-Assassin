var mongo = require('mongodb');

var MongoServer = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var DatabaseServer = new MongoServer('localhost', 27017, {auto_reconnect: true});
db = new Db('gamedb', DatabaseServer);
// To drop on command line... mongo gamedb --eval "db.dropDatabase()"

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


/*--------------------------------------------------------------------------------------------------------------------*/
// object creation functions

function Player(magic_cookie, handle, kills, deaths)
{
    this.magic_cookie = magic_cookie;
    this.handle = handle;
    this.kills = kills;
    this.deaths = deaths;
};


function Beacon(UUID, major, minor, color, notes)
{
	this.UUID = UUID;
	this.major = major;
	this.minor = minor;
	this.color = color;
	this.notes = notes;
};


/*--------------------------------------------------------------------------------------------------------------------*/
// Game functionality 


/**
 * This function is intended to be called by game clients at start up
 * 
 * It asks whether the server know about this player.  This is indicated by
 * having a player record containing the players unique magic cookie.
 * 
 * @todo Implementation:
 * Look for a match for the magic cookie value in the players collection.
 * If there is a matching result, then return yes, else no
 */
exports.isRegistered = function(req, res) {
	var variable = req.params.magic_cookie;
    db.collection('players', function(err, collection) {
        collection.find({ handle: variable } ).toArray(function(err, items) {
	        if (items.length > 0) {
	        	res.send("yes");
	        }
	        else {
	        	res.send("no");
	        }
        });
    });
};



/**
 *  This is intended to be called by the game client if the server does not yet
 * have a record of the magic cooke of the player.
 * 
 * @todo Implementation
 * Using the magic_cookie passed in as part of the POST parameters, create a new
 * Player object and put it into the databasr collection
 */
exports.register = function(req, res) {
	    var cookie = req.body;
	    console.log('Adding player with cookie: ' + JSON.stringify(cookie));
	    var player = {	     
	    	 magic_cookie: cookie,
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


/**
 * Set the game name or "handle" of the player.
 * 
 * @todo Basic Implementation
 * Look up the record matching the magic_cookie
 * Update the record with the new handle
 * 
 * Test:
 * curl -i -X POST -H 'Content-Type: application/json' -d '{"handle":"NEW NAME"}' http://localhost:3000/handle/MAGIC_COOKIE
 */
exports.setHandle = function(req, res) {
    
    var json = req.body;
    var new_handle = json.handle;
    var cookie = req.params.magic_cookie;
    res.send({new_handle:req.params.magic_cookie});
    db.collection('players').findAndModify(
    		  {magic_cookie: cookie}, // query
    		  [['_id','asc']],  // sort order
    		  {$set: {handle: new_handle}}, // replacement, replaces only the field "hi"
    		  {}, // options
    		  function(err, object) {
    		      if (err){
    		          console.warn(err.message);  // returns error if no matching object found
    		      }else{
    		          console.dir(object);
    		      }
    		  });
    
};


/**
 * 
 */
exports.getBeacon = function(req, res) {
	var player_cookie = req.params.magic_cookie;
	db.collection('assignments', function(err, collection) {
        collection.find({ player: player_cookie } ).toArray(function(err, items) {
	        if (items.length > 0) {
	        	var assignments = items[0];
	        	db.collection('beacons', function(err, collection) {
	                collection.find({ minor: items[0].beacon } ).toArray(function(err, results) {
	        	        if (results.length > 0) {
	        	        	var player_beacon = new Beacon(results[0].UUID, results[0].major, results[0].minor, results[0].color, results[0].notes)
	        	        	res.send(player_beacon);
	        	        }
	                });
	            });
	        }
        });
    });
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


exports.listRod = function(req, res) {
	
    db.collection('players', function(err, collection) {
        collection.find({ handle: "Rod" } ).toArray(function(err, items) {
            res.send(items);
        });
    });

};

exports.hasHandle = function(req, res) {
	var variable = req.params.handle;
    db.collection('players', function(err, collection) {
        collection.find({ handle: variable } ).toArray(function(err, items) {
        	if (items.length > 0)
        		res.send("yes");
        		else
        			res.send("no");

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
	     magic_cookie: "1",
	     handle: "Amit",
	     kills: 0,
	     deaths: 0
	 },
	 {
		 magic_cookie: "2",
	     handle: "Sam",
	     kills: 0,
	     deaths: 0
	 },
	 {
		 magic_cookie: "3",
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
