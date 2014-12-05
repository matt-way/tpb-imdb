
angular.module('tpbApp', [])
	.controller('MainCtrl', function($scope, $http){

		$scope.state = {
			selectedInfo: null
		};

		$http.get('/cache.json').success(function(result){
			$scope.movies = result.data;
		});
	});