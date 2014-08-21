var WebOffice = angular.module('WebOffice', []); 

WebOffice.controller('MainController', ['$location', '$rootScope', '$scope', 'Auth', 'Document', 
	function($location, $rootScope, $scope, Auth, Document){

			//Si existe un codigo de autorizacion, enviar para obtener el access_token
      var code = QueryString.stringify($location.$$absUrl,'code')
      if(code != null && code != '')
				Auth.getAccessToken(code);
	    
      //Si se hace click en ng-click="authorized()" entrar aqui.
      $scope.authorized = function() {   
        //Cerrar modal login y abrir caja de url externa
	      $('#login').modal('hide');
        $('#url-externa').modal('show');
        
        //Crear iframe dinamico y obtener completado o error de carga 
	    	var elementContainer = document.getElementById('url-externa');
	    	var oauth = new OAuthWindow(
          elementContainer,
          $rootScope.CONFIG.auth_url,
          {
            client_id: $rootScope.CONFIG.client_id,
            redirect_uri: $rootScope.CONFIG.redirect_uri,
            response_type: $rootScope.CONFIG.response_type,
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
      $scope.open_file = function(type) {
        $('#loading').attr('type',type);
        Document.list(type)
      };
      $scope.reload = function() {
        Document.list($('#loading').attr('type'))
      };
	    $scope.logout = function() {
	      Auth.logout();
	    };
	}
]);

WebOffice.run(function($rootScope, Auth, Document) {
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
  Document.list('all')
});