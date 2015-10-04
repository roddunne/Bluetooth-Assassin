var express = require('express');
var game = require('./routes/game');
var bodyParser = require('body-parser');
var app = express();

// allow us to magically get JSON out of a POST body
app.use(bodyParser.json())


/*--------------------------------------------------------------------------------------------------------------------*/
// Game functionality expectd to be called from Android client

app.get('/registered/:magic_cookie', game.isRegistered);
app.post('/register', game.register);
app.post('/handle/:magic_cookie', game.setHandle);
app.get('/beacon/:magic_cookie', game.getBeacon);
app.get('/target/:magic_cookie', game.getTarget);
app.get('/kill/:magic_cookie', game.informKill);
app.get('/gamestats', game.getGameStats);
app.get('/playerstats/:magic_cookie', game.getPlayerStats);

/*--------------------------------------------------------------------------------------------------------------------*/
// Helper and state testing functions expected to be called from a browser

app.get('/beacons', game.listBeacons);
app.get('/players', game.listPlayers);

app.listen(3000);
console.log('Listening on port 3000...');