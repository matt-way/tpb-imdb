
angular.module('tpbApp', [])
	.controller('MainCtrl', function($scope, $http){

		$scope.state = {
			selectedInfo: null,
			sortCol: 'imdbRating',
			sortReverse: true
		};

		$http.get('/cache.json').success(function(result){
			$scope.movies = result.data;
		});
	});