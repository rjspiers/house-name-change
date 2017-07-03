var app = angular.module('app', []);
app.controller('appCtrl', function($scope, $http) {
	var iisnodeRoute = '/node/house-name-change'
	
	// SDS
    $scope.results = {};
    $scope.results.data = [];
	// user property selection
    $scope.selectedAddress = {};
    $scope.selectedAddress.data = [];
	// name checking
    $scope.hasNewHouseNameBeenChecked = false;
	$scope.nameCheckResponse = {}
	$scope.nameCheckResponse.data = []
	
	$scope.nameCheckResponse.data.Pass = false
		
	// testing on gis server while SDS is blocked
	$scope.results.data = [{
    "gssCode": "E07000209",
    "uprn": "10007099272",
    "property": "1 Wey Valley House",
    "street": "Millbrook",
    "town": "Guildford",
    "area": "Surrey",
    "postcode": "GU1 3AU"
  },
  {
    "gssCode": "E07000209",
    "uprn": "10007099273",
    "property": "2 Wey Valley House",
    "street": "Millbrook",
    "town": "Guildford",
    "area": "Surrey",
    "postcode": "GU1 3AU"
  },
  {
    "gssCode": "E07000209",
    "uprn": "10007093990",
    "property": "Wey Valley House",
    "street": "Millbrook",
    "town": "Guildford",
    "area": "Surrey",
    "postcode": "GU1 3AU"
  },
  {
    "gssCode": "E07000209",
    "uprn": "10007060102",
    "property": "Beechanger",
    "street": "Birches Lane",
    "town": "Gomshall",
    "area": "Surrey",
    "postcode": "GU5 9QR"
  },
  {
    "gssCode": "E07000209",
    "uprn": "10007060103",
    "property": "Birches House",
    "street": "Birches Lane",
    "town": "Gomshall",
    "area": "Surrey",
    "postcode": "GU5 9QR"
  },
  {
    "gssCode": "E07000209",
    "uprn": "10007060106",
    "property": "Burrows Croft",
    "street": "Birches Lane",
    "town": "Gomshall",
    "area": "Surrey",
    "postcode": "GU5 9QR"
  },
  {
    "gssCode": "E07000209",
    "uprn": "100062331014",
    "property": "Millmead House",
    "street": "Millmead",
    "town": "Guildford",
    "area": "Surrey",
    "postcode": "GU2 4BB"
  },
  {
    "gssCode": "E07000209",
    "uprn": "10007055622",
    "property": "Watersmeet",
    "street": "127a Stoughton Road",
    "town": "Guildford",
    "area": "Surrey",
    "postcode": "GU1 1LH"
  },
  {
    "gssCode": "E07000209",
    "uprn": "100062331714",
    "property": "The Oaks",
    "street": "Applegarth Avenue",
    "town": "Guildford",
    "area": "Surrey",
    "postcode": "GU2 8LZ"
  }  
  ];
	
	console.log('$scope.results.data.length : ' + $scope.results.data.length);
	
	// watch for user editing $scope.newHouseName
	$scope.$watch("newHouseName", function () {
		$scope.hasNewHouseNameBeenChecked = false;
	})
	
	// Search SDS address
    $scope.addressSearch = function () {
        $scope.results.data = []; // reset results
        var config = {
            params: {
                'postcode': $scope.searchValue
            }
        };
        console.log('$scope.searchValue : ' + $scope.searchValue);
    	$http.get(iisnodeRoute + '/api/postcode', config).then(function (response) {
            console.log('response.data : ' + response.data);
    		$scope.results.data = response.data; // update results data
    		console.log('$scope.results.data.length : ' + $scope.results.data.length);
    		$scope.selectedAddress.data = []; // clear selected address
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