$(document).ready(function(){
  var mozL10n = document.mozL10n || document.webL10n;
  nav_page = mozL10n.get('nav_page', null, 'Page');
  find_msg = mozL10n.get('find_msg', null, 'Looking for results ...');
  type_doc = mozL10n.get('type_doc', null, 'Memory');
  result_cero = mozL10n.get('result_cero', null, 'No results were found.');
  storage = navigator.getDeviceStorage("sdcard");
  
  load();

    $('.ui.icon.button.refresh').click(function(){
	    load();   
    });

    $(".reply.mail.big.icon").click(function(){
      $(".ui.inverted.menu_principal").show();
      $(".ui.celled.grid.content").show();
      $(".ui.celled.grid.viewer").hide();
      $(".ui.celled.grid.viewer iframe").remove()
      $(".ui.menu.fixed_buttom").hide();
      $('.menu.sidebar._top')
        .sidebar('hide')
      ;
    });
    
});

function load(){
  $('.ui.inbox.list.active').html('<a id="Message" class="active item">'+find_msg+'</a>');
  $('.ui.segment.loading').show();
   
  $('.ui.inbox.list.active.odt').html('');
  $('.ui.inbox.list.odp').html('');
  $('.ui.inbox.list.ods').html('');

  var all_files = storage.enumerate();
  all_files.onsuccess = function() {
    while (this.result) {
      var file = this.result;
      if (file.name.match(/.odt$/) || file.name.match(/.odp$/) || file.name.match(/.ods$/)) {
        ultimo = file.name.split("/").pop();
        pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
        formato = ultimo.split(".")[1]
        if(formato == "odt"){
          $('.ui.inbox.list.active.odt').append(''+
            '<a id="'+file.name+'" class="item ui pdf">'+
              '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
              '<div class="content">'+
                '<div class="header">' + pdf + '</div>'+
                file.name+
              '</div>'+
            '</a>'
          );
        }else if(formato == "odp"){
          $('.ui.inbox.list.odp').append(''+
            '<a id="'+file.name+'" class="item ui pdf">'+
              '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
              '<div class="content">'+
                '<div class="header">' + pdf + '</div>'+
                file.name+
              '</div>'+
            '</a>'
          );
        }else if(formato == "ods"){          
          $('.ui.inbox.list.ods').append(''+
            '<a id="'+file.name+'" class="item ui pdf">'+
              '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
              '<div class="content">'+
                '<div class="header">' + pdf + '</div>'+
                file.name+
              '</div>'+
            '</a>'
          );
        }
      }

      if (!this.done) {
        this.continue();
      }

    }
    if (all_files.readyState != "pending"){
      $('#Message').remove(); 
      if ($('.ui.inbox.list.odt a').size() == 0){
        $('.ui.inbox.list.odt').html('<a id="Message" class="active item">'+result_cero+'</a>');
      }
      if ($('.ui.inbox.list.odp a').size() == 0){
        $('.ui.inbox.list.odp').html('<a id="Message" class="active item">'+result_cero+'</a>');
      } 
      if ($('.ui.inbox.list.ods a').size() == 0){
        $('.ui.inbox.list.ods').html('<a id="Message" class="active item">'+result_cero+'</a>');
      }
      $('.ui.segment.loading').hide();
    }
    $('.ui.inbox.list a').click(function(){
      if ($(this).attr("id") != "Message"){
        var fileName = $(this).attr("id");
        var iframe = '<IFRAME id="iframe" SRC="./webodf/index.html#'+fileName+'" WIDTH=99.9% HEIGHT=100% FRAMEBORDER=1 scrolling="no"></IFRAME>';
        $(".ui.inverted.menu_principal").hide();
        $(".ui.celled.grid.content").hide();
        $(".ui.celled.grid.viewer").show();
        $(".ui.celled.grid.viewer").html(iframe);
        $(".ui.menu.fixed_buttom").show();
        formato = fileName.split(".")[1]
        if (formato == "odp"){
          $(".ui.celled.grid.viewer iframe").load(function(){
            $(this).contents().find(".ui.dimmer.active").hide();
          });
        }
      }
    });    
  }
  all_files.onerror = function () {
    $('.ui.inbox.list.active').html('<a id="Message" class="active item">'+result_cero+'</a>');
    $('.ui.inbox.list.odp').html('<a id="Message" class="active item">'+result_cero+'</a>');
    $('.ui.inbox.list.ods').html('<a id="Message" class="active item">'+result_cero+'</a>');
  }
}