
angular.module('tpbApp', [])
	.controller('MainCtrl', function($scope, $http){
		$scope.something = 'hello';
		$scope.state = {
			selectedInfo: null,
			sortCol: 'imdbRating',
			sortReverse: true
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
		}
		//toggle open download row
		$scope.downloadClicked = function(movie){
			if ($scope.state.selectedDownload == movie.Title){
				$scope.state.selectedDownload = null;
			} else {
				$scope.state.selectedDownload = movie.Title;

				//grab torrents from API
				$scope.state.torrents = null;
				$http.get('/search?t=' + movie.Title, { cache: true }).success(function(result){
					$scope.state.torrents = result.list;
					$scope.loading = false;
				});
			}
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