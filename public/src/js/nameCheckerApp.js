var app = angular.module('app', []);
app.controller('appCtrl', function($scope, $http) {
	var iisnodeRoute = '/node/house-name-check'
	
	// SDS
    $scope.results = {};
    $scope.results.data = [];
	$scope.results.statusCode = 200;
	$scope.results.message = null
	$scope.results.messageClass = null
	// user property selection
    $scope.selectedAddress = {};
    $scope.selectedAddress.data = [];
	// name checking
    $scope.hasNewHouseNameBeenChecked = false;
	$scope.nameCheckResponse = {}
	$scope.nameCheckResponse.data = []
	
	$scope.nameCheckResponse.data.Pass = false
	
	console.log('$scope.results.data.length : ' + $scope.results.data.length);
	
	// watch for user editing $scope.newHouseName
	$scope.$watch("newHouseName", function () {
		$scope.hasNewHouseNameBeenChecked = false;
	})
	
	// Search SDS address
    $scope.addressSearch = function () {
        $scope.results.data = []; // reset results
		$scope.selectedAddress.data = []; // clear selected address
        var config = {
            params: {
                'postcode': $scope.searchValue
            }
        };
        console.log('$scope.searchValue : ' + $scope.searchValue);
    	responsePromise = $http.get(iisnodeRoute + '/api/postcode', config)
		
		// promise.then(onFullfilled, onRejected)
		responsePromise.then(function (response) {
            // status code
			console.log('response.statusCode : ' + response.status);
			$scope.results.statusCode = response.status;
			// data
            console.log('response.data : ' + response.data);
    		$scope.results.data = response.data; // update results data
			// length of response data
    		console.log('$scope.results.data.length : ' + $scope.results.data.length);
    	}, function (response) {
			console.log(response)
			//$scope.results.statusCode = statusCode
			$scope.results.statusCode = response.status;
			$scope.results.message = response.data.error;
			$scope.results.messageClass = 'label label-danger'
		});  
    };

	// Select address from list
    $scope.selectAddress = function (item) {
        console.log('$scope.results.data : ' + $scope.results.data, $scope.results.data)
        $scope.results.data = [] // clear results
        console.log('$scope.results.data : ' + $scope.results.data, $scope.results.data)
        $scope.selectedAddress.data = [item] // set selected address
        console.log('$scope.selectedAddress.data : ' + $scope.selectedAddress.data, $scope.selectedAddress.data)
    };
    
	// Check new house name
    $scope.newHouseNameCheck = function () {
		$scope.loading = true
		// log new name to search for
        console.log($scope.newHouseName)
		
		// reset any previous checks
		$scope.nameCheckResponse.data = []
		
		// get data
		// send - uprn of selected property, new house name
        var config = {
            params: {
                'uprn': $scope.selectedAddress.data[0].uprn,
				'newHouseName': $scope.newHouseName,
            }
        };
		$http.get(iisnodeRoute + '/api/nameCheck', config).then(function (response) {
            console.log('response.data : ' + response.data, response.data);
    		$scope.nameCheckResponse.data = response.data; // update results data
			console.log($scope.nameCheckResponse.data)
			
			// loading done
			$scope.loading = false
			// set checked to true 
			$scope.hasNewHouseNameBeenChecked = true
    	}); 
		
    }
    
	// Submit form
    $scope.submitHouseNameChangeRequest = function () {
        console.log('submitting the following:')
        console.log($scope.newHouseName, $scope.selectedAddress.data)
        // TODO http post the submitted data into a DB ready to be approved by GBC staff
        // TODO http post should trigger notification to GBC staff
            	
        // http method with config
    	var data = {
            'newname': $scope.newHouseName
        }
    	
    	$http({
    	    method: 'POST',
    	    url: iisnodeRoute + '/api/msg',
    	    data: data
    	})
        .then(function successCallback(response) {
            console.log(response)
        }, function errorCallback(response) {
            console.log(response)
        });
    }
    
});