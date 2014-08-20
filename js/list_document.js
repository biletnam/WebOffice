$(document).ready(function(){
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

});

function load(){
  $('#loading').addClass('fa-spin'); 
  $('#'+type+' ul').html('');
  $('#'+type+' ul').html(''+
    '<li id="Message" class="list-group-item">'+
      '<div class="media">'+
        '<div class="media-body" style="text-align:center;">'+
          '<div><a href="#">'+find_msg+'</a></div>'+
        '</div>'+
      '</div>'+
    '</li>'
  );
  var all_files = storage.enumerate();
  all_files.onsuccess = function() {
    while (this.result) {
      var file = this.result;
      var re = new RegExp(type);
      if (file.name.match(re)) {
        ultimo = file.name.split("/").pop();
        pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
        formato = ultimo.split(".")[1]
          $('#'+formato+' ul').append(''+
            '<li class="list-group-item">'+
              '<div class="media">'+
                '<div class="pull-left thumb-sm">'+
                  '<a class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i> <i class="fa  fa-file-text fa-stack-1x fa-1x fa-inverse"></i></a>'+
                '</div>'+
                '<div class="pull-right text-success m-t-sm">'+
                  '<div class="btn-group">'+
                    '<a class="btn btn-default btn-xs" ><i class="fa fa-cloud-upload"></i></a>'+
                    '<a class="btn btn-info btn-xs"><i class="fa fa-cloud-download"></i></a>'+
                  '</div>'+
                '</div>'+
                '<div class="media-body">'+
                  '<div><a href="#">' + pdf + '</a></div>'+
                  '<small class="text-muted"><span class="badge bg-info url-sdcard">'+file.name+'</span></small>'+
                '</div>'+
              '</div>'+
            '</li>'
          );      
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
                '<div><a href="#">'+result_cero+'</a></div>'+
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
            '<div><a href="#">'+result_cero+'</a></div>'+
          '</div>'+
        '</div>'+
      '</li>'
    );
  }
}