var WebOffice = angular.module('WebOffice', []); 

WebOffice.controller('MainController', ['$location', '$rootScope', '$scope', 'Auth', 
	function($location, $rootScope, $scope, Auth){
	    
	    var regexS = "[\\?&]"+'code'+"=([^&#]*)";
			var regex = new RegExp (regexS);
			var tmpURL = $location.$$absUrl;
			var results = regex.exec( tmpURL );
			
			if( results != null && results[1] != '')
				Auth.getAccessToken(results[1]);
	    $scope.authorized = function() {
        
        //Cerrar modal login y abrir caja de url externa
	      $('#login').modal('hide');
        $('#url-externa').modal('show');
        
        var paramObj = {
		      client_id: $rootScope.CONFIG.client_id,
		      redirect_uri: $rootScope.CONFIG.redirect_uri,
		      response_type: $rootScope.CONFIG.response_type
		    };
		    var location = $rootScope.CONFIG.auth_url + '?'+QueryString.stringify(paramObj)+'';
	    	var elementContainer = document.getElementById('url-externa');
	    	var oauth = new OAuthWindow(
         elementContainer,
         $rootScope.CONFIG.auth_url,
         location,
         {
           response_type: $rootScope.CONFIG.response_type,
           client_id: $rootScope.CONFIG.client_id,
           redirect_uri: $rootScope.CONFIG.redirect_uri,
           scope: '',
           state: '',
           access_type: '',
           approval_prompt: ''
         }
       );
	    	oauth.open();
	     oauth.oncomplete = function(params) {
          if ('error' in params) {
	          return oauth.cancel();
	        }

	        if (!params.code) {
	          return console.error('authentication error');
	        }

	        Auth.getAccessToken(params.code);
       };
   
       oauth.onabort = function() {
         return oauth.cancel();
       };
	    };

	    $scope.logout = function() {
	      Auth.logout();
        Auth.authenticate();
	    };
	}
]);

WebOffice.run(function($rootScope, Auth) {
  $rootScope.CONFIG = {
    apiUrl: 'http://localhost:8000',
    auth_url: 'http://localhost:8000/oauth2/authorize/',           // required
    response_type: 'code',      // required - "code"/"token"
    token_url: 'http://localhost:8000/oauth2/access_token/',          // required if response_type = 'code'
    logout_url: '',         // recommended if available
    client_id: '20cf1cd6ae36568e29aa', // required
    client_secret: '8881f062b2772c75139793f4876d01e3d4a9052c', // required if response_type = 'code'
    redirect_uri: 'http://localhost:8000/test/',       // required - some dummy url
    other_params: {}        // optional params object for scope, state, display...
  };
  Auth.authenticate()
});