
angular.module('tpbApp', ['ngStorage'])
	.controller('MainCtrl', function($scope, $http, $localStorage, $sessionStorage){
		$scope.something = 'hello';
		//seenit
		if(!$localStorage.seenIt){
			$localStorage.seenIt = {};
		}

		$scope.state = {
			selectedInfo: null,
			sortCol: 'imdbRating',
			sortReverse: true,
			genreFilter: '',
			seenIt: $localStorage.seenIt
		};

		$scope.loading = true;
		$http.get('/cache.json').success(function(result){
			$scope.movies = result;
			$scope.loading = false;
		});

		//toggle open info row
		$scope.infoClicked = function(movie){
			if ($scope.state.selectedInfo == movie.Title){
				$scope.state.selectedInfo = null;
			} else {
				$scope.state.selectedInfo = movie.Title;
			}
			//grab torrents from API
			$scope.state.torrents = null;
			$scope.loadingTorrents = true;
			$http.get('/search?t=' + movie.Title, { cache: true }).success(function(result){
				$scope.state.torrents = result.list.slice(0,10);
				$scope.loadingTorrents = false;
			});
		}

		//seenIt
		$scope.addSeenIt = function(movieTitle){
			$localStorage.seenIt[movieTitle] = { seen: true };
		}
	})
	.filter('bytes', function() {
		return function(bytes, precision) {
			if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
			if (typeof precision === 'undefined') precision = 1;
			var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
				number = Math.floor(Math.log(bytes) / Math.log(1024));
			return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
		}
	});