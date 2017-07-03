// var app = angular.module('app', []);
// app.controller('myCtrl', function($scope, $http) {
//     $scope.query = $scope.searchValue;
//     console.log($scope.searchValue);
//     console.log($scope.query);
// 	$http.get('/searchApi/postcodeStatic').then(function (response) {
// 	  console.log(response.data);
// 		$scope.results = response.data;
// 	});
// 	$scope.getUPRN = function (uprn) {
// 	    console.log(uprn);
// 	};
// });

var app = angular.module('app', []);
app.controller('appCtrl', function($scope, $http) {
    $scope.results = {};
    $scope.results.data = [];
    $scope.selectedAddress = {};
    $scope.selectedAddress.data = [];
    $scope.hasNewHouseNameBeenChecked = 'false';
	console.log('$scope.results.data.length : ' + $scope.results.data.length);
    $scope.addressSearch = function () {
        $scope.results.data = []; // reset results
        var config = {
            params: {
                'postcode': $scope.searchValue
            }
        };
        console.log('$scope.searchValue : ' + $scope.searchValue);
    	$http.get('/searchApi/postcode', config).then(function (response) {
            console.log('response.data : ' + response.data);
    		$scope.results.data = response.data; // update results data
    		console.log('$scope.results.data.length : ' + $scope.results.data.length);
    		$scope.selectedAddress.data = []; // clear selected address
    	});  
    };

    $scope.selectAddress = function (item) {
        console.log('$scope.results.data : ' + $scope.results.data, $scope.results.data)
        $scope.results.data = [] // clear results
        console.log('$scope.results.data : ' + $scope.results.data, $scope.results.data)
        $scope.selectedAddress.data = [item] // set selected address
    };
    
    $scope.newHouseNameCheck = function () {
        console.log($scope.newHouseName)
        $scope.hasNewHouseNameBeenChecked = 'true'
    }
    
    $scope.submitHouseNameChangeRequest = function () {
        console.log('submitting the following:')
        console.log($scope.newHouseName, $scope.selectedAddress.data)
        // TODO http post the submitted data into a DB ready to be approved by GBC staff
        // TODO http post should trigger notification to GBC staff
        
        
        var config = {
            params: {
                'newname': $scope.newHouseName
            }
        };
    	$http.post('/searchApi/msg/' + $scope.newHouseName, config).then(function (response) {
            console.log(response);
    	});  
    }
    
	$scope.getUPRN = function (uprn) {
	    console.log(uprn);
	};
});