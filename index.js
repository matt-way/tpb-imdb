
/**
 * Module dependencies.
 */

var express = require('express'),
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
app.use(serveStatic(app.get('public')));

app.listen(app.get('port'), function(){
  console.log('tpb-imdb frontend server listening on port ' + app.get('port'));
});

app.get('/cache.json', function (req, res) {
	console.log('Sending movie cache');
	var serveCache = { 'data': cachedResults };
	res.send(serveCache);
})

//torrent search endpoint
app.get('/search', function (req, res) {
	//if title query string exists
	if(req.query.t){
		tpb.search(req.query.t,{
			category: '201',
			orderBy: '7'
		}).then(function(results){
			//console.log(results);
			res.send({ response: 'true',
					   data: results }
			);
		}).catch(function(err){
			console.log(err);
			res.send({response: 'false'});
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
	//get top movies from tpb
	tpb.topTorrents('201')
	.then(function(results){
		//clear cache
		cachedResults = [];
		var movieList = [];

		var resultsLength = results.length;
		//iterate through results
		for(i = 0; i < resultsLength; i++){
			//tidy up torrent title
			var movieTitle = titleTidy(results[i].name);
			//push to movie list
			movieList.push(toTitleCase(movieTitle));
			//after iterating through results
			if(i == resultsLength - 1){
				//de-duplicate
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
		}

	}).catch(function(err){
		console.log(err);
	});

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