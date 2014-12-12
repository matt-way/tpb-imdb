
/**
 * Module dependencies.
 */

var express = require('express'),
lessMiddleware = require('less-middleware'),
	path = require('path'),
	serveStatic = require('serve-static'),
	request = require('request'),
	tpb = require('thepiratebay'),
	_ = require('lodash');;

var app = express();
var cachedResults = [];

// all environments
app.set('port', process.env.PORT || 3000);
app.set('public', path.join(__dirname, 'public'));

// setup the static file folder
// NOTE: this must go before routes, as routes have a catch all setup
app.use(lessMiddleware(app.get('public')));
app.use(serveStatic(app.get('public')));

app.listen(app.get('port'), function(){
  console.log('tpb-imdb frontend server listening on port ' + app.get('port'));
});

app.get('/cache.json', function (req, res) {
	console.log('Sending movie cache');
	//var serveCache = { 'data': cachedResults };
	res.send(cachedResults);
})

//torrent search endpoint
app.get('/search', function (req, res) {
	//if title query string exists
	if(req.query.t){

		var searchURL = 'https://kickass.so/json.php?q='+ req.query.t + '%20category:movies&field=seeders&sorder=desc';
		request(searchURL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				res.send(JSON.parse(body)); // Print the google web page.
			}
		});
	}else{
		res.send({response: 'false'});
	}
})

//build the cache - rebuilds every 60 minutes
rebuildCache();

//some functions
function rebuildCache(){
	console.log('Rebuilding movie cache');

	var movieList = [];
	cachedResults = [];

	//loop request 3 times
		//add to array
	//on 4th time pluck titles

	var pages = 4;
	var count = 0;
	for(k = 1; k < pages + 1; k++){
		var moviesURL = 'https://kickass.so/json.php?q=%20category:movies&field=seeders&sorder=desc&page=' + k;
		request(moviesURL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//do the thing
				var json = JSON.parse(body);
				var results = json.list;

				var resultsLength = results.length;
				//iterate through results
				for(i = 0; i < resultsLength; i++){
					//tidy up torrent title
					var movieTitle = toTitleCase(titleTidy(results[i].title));
					//push to movie list
					movieList.push(movieTitle);
				}
			}
			count++;
			//after iterating through results
			if(count == pages){
				movieListUnDupe = _.uniq(movieList);

				//request imdb info for each movie title.
				for(j = 0; j < movieList.length; j++){
					imdb(movieListUnDupe[j], function(body){
						movie = JSON.parse(body);
						//if the movie was found at IMDb
						if(movie.Response == 'True' && movie.imdbRating != 'N/A'){
							cachedResults.push(movie);
						}else{
							//do nothing for now
							//later: start trimming words from the end of the title
						}
					});
				}
			}
		});
	}

	//rebuild every hour
	setTimeout(function(){
		rebuildCache();
	},3600000);
};

//get movie info from omdb API
function imdb(title, callback){
	request('http://www.omdbapi.com/?t=' + title, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		//console.log(body) // Print the google web page.
		callback(body);
	  }
	})
}

//tidy up torrent titles -> movie titles
function titleTidy(str){
	//remove stops
	var strNoStops = str.replace(/\./g, ' ');

	//regex out title[1]
	var titleRegexp = /(.*)(19\d{2}|20\d{2})/g;
	var matches = titleRegexp.exec(strNoStops);
	//don't worry if there's not date in the title
	if(matches){
		titleDirty = matches[1];
	}else{
		titleDirty = strNoStops;
	}
	//more regex nonsense to remove whitespace and non-text characters
	var titleRegexpClean = /(\b\s\(\w*\s\/\s$|\b\s\D$|\b\s$)/g;
	titleClean = titleDirty.replace(titleRegexpClean, '');

	return	titleClean;
}

//convert string to title case
function toTitleCase(str){
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}