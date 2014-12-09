
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

		$scope.infoClicked = function(movie){
			if ($scope.state.selectedInfo == movie.Title){
				$scope.state.selectedInfo = null;
			} else {
				$scope.state.selectedInfo = movie.Title;
			}
		}
		$scope.selectedInfo = null;
	});