var WebOffice = angular.module('WebOffice'); 

WebOffice.factory('Auth', function ($http, $rootScope, Storage) {
    var getAuthToken = function() {
        try {
            return Storage.get('accessToken');
        } catch (e) {}
    };

    var authenticate = function(accessToken) {
        if (typeof(accessToken) == 'undefined') {
            accessToken = getAuthToken();
        }
        // Let's attempt an API call
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        var config = {
            'method': 'GET',
            'url': $rootScope.CONFIG.apiUrl + '/users/'
        };

        $http(config) // Get user data
        .success(function(data) {
            $rootScope.user = data.results[0];
        })
        .error(function(data, status) {
            $rootScope.user = '';
            if (status == 0) {
                console.log('No se pudo llegar a API')
            }
            console.log('No existe un access_token')
        });
    }

    // Public API here
    return {
        authenticate: function() {
            return authenticate();
        },
        getAccessToken: function(code) {
            var data = {
                code: code,
                client_id: $rootScope.CONFIG.client_id,
                client_secret: $rootScope.CONFIG.client_secret,
                redirect_uri: $rootScope.CONFIG.redirect_uri,
                grant_type:"authorization_code"
            };
            $http({
                url: $rootScope.CONFIG.apiUrl + "/oauth2/access_token",
                method: "POST",
                data: QueryString.stringify(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': null
                }
            }).success(function(data, status, headers, config) {
                console.log('Authentication Successful!');
                Storage.save(data.access_token)
                authenticate(data.access_token);
                $('#url-externa').modal('hide');
                $('#profile').tab('show');
                $('a[href="#profile"]').show();
                $('a[href="#profile"]').tab('show');

            }).error(function(data, status) {
                if (status == 0) {
                    console.log('Could not reach API');
                } else if (data.error == 'invalid_grant') {
                    console.log('invalid_grant');
                }
            });
        },
        logout: function() {
        	Storage.remove('accessToken');
            authenticate();
        },
    }
});
WebOffice.service('Storage', ['$window',
  function($window) {
    var accessToken = '';
    if (!$window.localStorage) {
			alert('No tienes localStorage activado');
		}
	  this.save = function(token) {
			$window.localStorage.setItem('accessToken', token);
	  }

	  this.get = function(key) {
	  	return $window.localStorage.getItem(key);
	  }

	  this.remove = function(key) {
	  	$window.localStorage.removeItem(key);
	  }
	}
]);

