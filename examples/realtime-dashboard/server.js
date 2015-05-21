//Set up our express server.
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile("index.html");
});

//Initialize our super simple database.
var votes = [
    {
        name: "Red",
        count: 2
    },
    {
        name: "Green",
        count: 3
    },
    {
        name: "Blue",
        count: 1
    }
];

//Find the server's local IP address, so the class can navigate to it.
//See: http://stackoverflow.com/a/9542157/2418448
var serverAddress = "http://0.0.0.0:" + port + "/";
require('dns').lookup(require('os').hostname(), function (err, ip, fam) {
    serverAddress = "http://" + ip + ":" + port + "/";
});

//Listen for HTTP connections.
server.listen(port, function () {

	console.log('Dashboard server listening on port ' + port);

    //Listen for socket connections too.
	io.on('connection', function(socket) {

        //Send an initial state to the client.
        socket.emit('votes', votes);
        socket.emit('server', serverAddress);

		socket.on('vote', function(color) {
            //When a vote comes in from a client,
            //update the vote counts and tell the other clients.
            incrementVote(color);
            updateSockets();
		});

		socket.on('reset', function() {
			resetVotes();
			updateSockets();
		});

	});
});

var incrementVote = function(color) {
    votes.forEach(function(vote) {
        if (vote.name === color) {
            vote.count++;
        }
    });
};

var resetVotes = function() {
	votes.forEach(function(vote) {
		vote.count = 0;
	});
};

var updateSockets = function() {
    io.emit('votes', votes);
};
