function UploadFile(evt) {
  var files = evt.target.files;
  var URL = window.URL || window.webkitURL;
  cont = 1
  for (var i = 0, f; f = files[i]; i++) {     
    var reader = new FileReader();
    reader.onload = (function(f) {
      return function(e) {
        ultimo = f.name.split("/").pop();
        pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
        formato = ultimo.split(".")[1]
        if(formato == "odt" || formato == "odp" || formato == "ods"){
          
          timestamp = new Date().getTime()
          try{
            database.add(f.name,e.target.result,timestamp);
            var button_remove = '<i timestamp="'+timestamp+'" class="remove icon big right floated"></i>';
          }
          catch(err) {
            var button_remove = ''
          }
          
          Url = URL.createObjectURL(f);
          if(formato == "odt"){
            $('.ui.inbox.list.odt').append(''+
              '<a id="'+Url+'" class="item ui pdf new_item">'+
                button_remove+
                '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
                '<div class="content">'+
                  '<div class="header">' + pdf + '</div>'+
                  f.name+
                '</div>'+
              '</a>'
            );
            $('.ui.inbox.list.odp').removeClass('active');
            $('.ui.inbox.list.ods').removeClass('active');
            $('.ui.inbox.list.odt').addClass('active');
            $('#odp').removeClass('active');
            $('#ods').removeClass('active');
            $('#odt').addClass('active');
          }else if(formato == "odp"){
            $('.ui.inbox.list.odp').append(''+
              '<a id="'+Url+'" class="item ui pdf new_item">'+
                '<i timestamp="'+timestamp+'" class="remove icon big right floated"></i>'+
                '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
                '<div class="content">'+
                  '<div class="header">' + pdf + '</div>'+
                  f.name+
                '</div>'+
              '</a>'
            );
            $('.ui.inbox.list.odt').removeClass('active');
            $('.ui.inbox.list.ods').removeClass('active');
            $('.ui.inbox.list.odp').addClass('active');
            $('#odt').removeClass('active');
            $('#ods').removeClass('active');
            $('#odp').addClass('active');
          }else if(formato == "ods"){          
            $('.ui.inbox.list.ods').append(''+
              '<a id="'+Url+'" class="item ui pdf">'+
                '<i timestamp="'+timestamp+'" class="remove icon big right floated"></i>'+
                '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
                '<div class="content">'+
                  '<div class="header">' + pdf + '</div>'+
                  f.name+
                '</div>'+
              '</a>'
            );
            $('.ui.inbox.list.odt').removeClass('active');
            $('.ui.inbox.list.odp').removeClass('active');
            $('.ui.inbox.list.ods').addClass('active');
            $('#odt').removeClass('active');
            $('#odp').removeClass('active');
            $('#ods').addClass('active');
          }
        }else{
          alert('El Archivo debe subirse en formato opendocument (.odt, .odp, .ods)')
        }
        if (cont == files.length){
          $('.remove.icon').click(function(){
              database.del(parseInt($(this).attr('timestamp')));
              $(this).parent().remove();
          });
          $('.ui.inbox.list a div').click(function(){
            if ($(this).attr("id") != "Message"){
              var fileName = $(this).parent().attr("id");
              var iframe = '<IFRAME id="iframe" SRC="./webodf/index.html#'+fileName+'" WIDTH=99.9% HEIGHT=100% FRAMEBORDER=1 scrolling="no"></IFRAME>';
              $(".ui.inverted.menu_principal").hide();
              $(".ui.celled.grid.content").hide();
              $(".ui.celled.grid.viewer").show();
              $(".ui.celled.grid.viewer").html(iframe);
              $(".ui.menu.fixed_buttom").show();
              formato = fileName.split(".")[1]
              $(".ui.celled.grid.viewer iframe").load(function(){
                $(this).contents().find(".ui.dimmer.active").hide();
              });
            }
          });
          cont = 1
        }
        cont += 1
      };
    })(f);

    if (f) {
      reader.readAsDataURL(f);
    }
  }
}