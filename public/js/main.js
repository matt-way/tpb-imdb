
angular.module('tpbApp', [])
	.controller('MainCtrl', function($scope, $http){

		$http.get('/cache.json').success(function(result){
			$scope.movies = result.data;
		});
	});