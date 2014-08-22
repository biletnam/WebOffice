var WebOffice = angular.module('WebOffice'); 

WebOffice.factory('Document', function ($http, $rootScope, Storage) {
    var getAuthToken = function() {
      try {
          return Storage.get('accessToken');
      } catch (e) {}
    };    
      var download_file = function(self,url,title) {
          window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

          function onError(e) {
            console.log('Error', e);
          }

          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'blob';

          xhr.onload = function(e) {
            var sdcard = navigator.getDeviceStorage("sdcard");

            var request = sdcard.addNamed(xhr.response, title);

            request.onsuccess = function () {
              var name = this.result.name;
              console.log('El archivo "' + title + '" se escribió correctamente en el área de almacenamiento sdcard');
              $(self).removeClass('btn-default');
              $(self).addClass('btn-info');
            }

            // Un error suele producirse si un archivo con el mismo nombre ya existe
            request.onerror = function () {
              console.warn('No se puede escribir el archivo: ' + this.error);
            }
          };

          xhr.send();
        };

    var add_file = function(file,type,upload,download) {
        $('#'+type+' ul').append(''+
          '<li class="list-group-item">'+
            '<div class="media">'+
              '<div class="pull-left thumb-sm">'+
                '<a class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i> <i class="fa  fa-file-text fa-stack-1x fa-1x fa-inverse"></i></a>'+
              '</div>'+
              '<div class="pull-right text-success m-t-sm">'+
                '<div class="btn-group">'+
                  '<a class="btn '+upload+' btn-xs" ><i class="fa fa-cloud-upload"></i></a>'+
                  '<a class="btn '+download+' btn-xs download_file"><i class="fa fa-cloud-download"></i></a>'+
                '</div>'+
              '</div>'+
              '<div class="media-body">'+
                '<div><a href="#">' + file.title + '</a></div>'+
                '<small class="text-muted"><span class="badge bg-info url-sdcard">'+file.archive+'</span></small>'+
              '</div>'+
            '</div>'+
          '</li>'
        );
        $('.download_file').click(function(){
          if ($(this).attr('class') != 'btn btn-info btn-xs download_file')
            ultimo = file.archive.split("/").pop();
            pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
            download_file(this,file.archive,pdf);
        });
    };

    var list = function(accessToken,type) {
        if (typeof(accessToken) == 'undefined' || accessToken == '') {
            accessToken = getAuthToken();
        }

        // Let's attempt an API call
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        var config = {
            'method': 'GET',
            'url': $rootScope.CONFIG.apiUrl + '/archives/'
        };

        $http(config) // Get user data
        .success(function(data) {
            $rootScope.files = data.results;
            for (file in $rootScope.files){
              ultimo = $rootScope.files[file].archive.split("/").pop();
              pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
              unit_type = ultimo.split(".")[1]
              $rootScope.files[file].title =  pdf;
              $rootScope.files[file].archive = $rootScope.CONFIG.apiUrl + '/' + $rootScope.files[file].archive;
              add_file($rootScope.files[file],unit_type,'btn-info','btn-default');
              
            }
            
        })
        .error(function(data, status) {
            $rootScope.files = [];
            if (status == 0) {
                console.log('No se pudo llegar a API')
            }
            console.log('No existe un access_token')
        });

        if (typeof(type) != 'undefined' && type != '') {
          $('#loading').addClass('fa-spin'); 
          $('#'+type+' ul').html('');
          $('#'+type+' ul').html(''+
            '<li id="Message" class="list-group-item">'+
              '<div class="media">'+
                '<div class="media-body" style="text-align:center;">'+
                  '<div><a href="#">Looking for results ...</a></div>'+
                '</div>'+
              '</div>'+
            '</li>'
          );
          storage = navigator.getDeviceStorage("sdcard");
          var all_files = storage.enumerate();
          all_files.onsuccess = function() {
            while (this.result) {
              var file = this.result;
              var re = new RegExp(type);
              if (file.name.match(re)) {
                ultimo = file.name.split("/").pop();
                pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
                var file = {
                  title: pdf,
                  archive: file.name,
                }
                var title = false;
                $('#'+type+' ul li').each(function(index) {
                  if (file.title == $(this).find('.media-body div a').html()){
                    $(this).find('.download_file').removeClass('btn-default');
                    $(this).find('.download_file').addClass('btn-info')
                    title = true;
                  }
                });
                console.log(title)
                if (title == false)
                  add_file(file,type,'btn-default','btn-info');      
              }

              if (!this.done) {
                this.continue();
              }

            }
            if (all_files.readyState != "pending"){
              $('#Message').remove(); 
              if ($('#'+type+' ul li').size() == 0){
                $('#'+type+' ul').html(''+
                  '<li id="Message" class="list-group-item">'+
                    '<div class="media">'+
                      '<div class="media-body" style="text-align:center;">'+
                        '<div><a href="#">No results were found.</a></div>'+
                      '</div>'+
                    '</div>'+
                  '</li>'
                );
              }
              $('#loading').removeClass('fa-spin'); 
            }
            $('.media-body').click(function(){
              if ($(this).attr("id") != "Message"){
                var fileName = $(this).find('.text-muted span').html();
                ultimo = fileName.split("/").pop();
                pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
                formato = fileName.split(".")[1]

                var iframe = '<IFRAME id="iframe" SRC="./webodf/index.html#'+fileName+'" WIDTH=99.9% HEIGHT=100% FRAMEBORDER=1 scrolling="no"></IFRAME>';
                $('#url-externa').modal('show')
                $('.modal-body').html(iframe);
                $('#url_name').html(pdf)
                $('#url-externa').on('hidden.bs.modal', function (e) {
                  $('.modal-body iframe').remove()
                })
                $(".modal-body iframe").load(function(){
                  $('.fa.fa-refresh').removeClass('fa-spin');
                  if (formato == "odp"){
                    $(this).contents().find(".ui.dimmer.active").hide();
                  }
                });
              }
            });
          }
          all_files.onerror = function () {
            $('#'+type+' ul').html(''+
              '<li id="Message" class="list-group-item">'+
                '<div class="media">'+
                  '<div class="media-body" style="text-align:center;">'+
                    '<div><a href="#">No results were found.</a></div>'+
                  '</div>'+
                '</div>'+
              '</li>'
            );
          }
        }
    }

    // Public API here
    return {
        list: function(type) {
            return list('',type);
        },
    }
});
/*$(document).ready(function(){
  var mozL10n = document.mozL10n || document.webL10n;
  nav_page = mozL10n.get('nav_page', null, 'Page');
  find_msg = mozL10n.get('find_msg', null, 'Looking for results ...');
  type_doc = mozL10n.get('type_doc', null, 'Memory');
  result_cero = mozL10n.get('result_cero', null, 'No results were found.');
  try {
    storage = navigator.getDeviceStorage("sdcard");
    $('#top_menu ul li').click(function(e){
      e.preventDefault()
      type = $(this).find('a').attr('href').split('#')[1];
      $('#loading').attr('type',type);
      $(this).tab('show')
      if ($('#'+type+' ul li').size() == 0){
        load();
      }
    });

    $('#loading').click(function(){
      load();   
    });
  }
  catch(err) {
    database = new WebOffice();
    database.init("weboffice", 2);
    $('#files').show();
    $('#files').on('change', UploadFile);
    $('.ui.icon.button.refresh').click(function(){
      database.items();  
    });
  } 

});*/