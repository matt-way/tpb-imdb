
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
			$scope.movies = result.data;
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
				$http.get('/search?t=' + movie.Title).success(function(result){
					$scope.state.torrents = result.data;
					$scope.loading = false;
				});
			}
		}

	});