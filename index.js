
/**
 * Module dependencies.
 */

var express = require('express'),
	path = require('path'),
	serveStatic = require('serve-static'),
	request = require('request');

var app = express();

// all environments
app.set('port', 3000);
app.set('public', path.join(__dirname, 'public'));

// setup the static file folder
// NOTE: this must go before routes, as routes have a catch all setup
app.use(serveStatic(app.get('public')));


app.get('/cache.json', function(req, res, next){
	request('https://guarded-hamlet-4288.herokuapp.com/cache.json', function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		return res.send(JSON.parse(body));
 	 	}
	});
});


app.listen(app.get('port'), function(){
  console.log('tpb-imdb frontend server listening on port ' + app.get('port'));
});