var express = require('express');
var path = require('path');
var twitter = require('ntwitter');   //Include the ntwitter module for gathering data from twitter API
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express(); //Instantiation of Express module to app object
var server= require('http').createServer(app); //Creation of server object by getting http module
var port=3000;
server.listen(port);
console.log("Server Listening at http://127.0.0.1:" + port);
var sio=require('socket.io').listen(server); //Socket.io object creation

var love= 0; //Count of Love tweets
var hate= 0; //Count of Hate Tweets
var total = 0; // Count of Total Tweets

//Initialization of twitter object by passing Consumer keys, secrets which is stored in Environment variables
var twitObj = new twitter({ 
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

//Callback Function for 'connection event'
sio.sockets.on('connection', function(socket){ 
	console.log('Web Client Connected');
	twitObj.stream('statuses/filter', {track: ['love', 'hate']}, function(stream){
		stream.on('data', function(data){       //Event Handler for Twitter data Stream
			var text=data.text.toLowerCase();
			if(text.indexOf("hate")!= -1){  //Check for hate tweets and increments the counter
				hate++; total++;
			}			
			if(text.indexOf("love")!= -1){  //Check for love tweets and increments the counter
				love++; total++;
			}
			socket.volatile.emit('tweet',{  //Action events for server 
				user: data.user.screen_name,//Including Screen Name for User
				text: data.text,            //Including Text of Tweet
				totalCount:total,	    //Total Tweet Count							
				lovePercent: (love/total)*100,	    //Percentage of Love Tweets
				hatePercent: (hate/total)*100,      //Percentage of Hate Tweets
				love: love,			    // Count of Love Tweets
				hate: hate			    // Count of Hate Tweets
			});
		});

	});
	socket.on('disconnect', function(){ //Event Handler for connection break from browser
		console.log('Web client disconnected');
});



});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
