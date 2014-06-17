$(document)
  .ready(function() {
    var mozL10n = document.mozL10n || document.webL10n;

    //Activar Las pestañas ODT, ODP Y ODS
    $('.filter.menu .item')
      .tab()
    ;

    //Activar Menu de la Izquierda.
    $('.sidebar.menu._left')
      .sidebar({
        overlay: true
      })
      .sidebar('attach events', '.open_menu_left, .close_menu_left')
    ;

    //Activar Menu de la derecha.
    $('.sidebar.menu._right')
      .sidebar({
        overlay: true
      })
      .sidebar('attach events', '.open_menu_right, .close_menu_right')
    ;
    //Remover el Menu de la izquierda al abrir el de la derecha
    $('.open_menu_right, .close_menu_right').click(function(){
        $('.sidebar.menu._left').removeClass('active');
    });

    //Activar Menu de Abajo.
    $('.sidebar.menu._top')
      .sidebar({
        overlay: true
      })
      .sidebar('attach events', '.open_menu_top, .close_menu_top')
    ;

    //Alertar que foxxapp esta en construccion.
    $('.ui.modal.email.foxxapp')
      .modal('setting', {
        onShow    : function(){
          var web_construction = mozL10n.get('web_construction', null, 'Sorry, our web page is actually in construction. If you like it, you can register your e-mail to stay pending of our latest news.');
          window.alert(web_construction);
        }
      })
      .modal('attach events', '.ui.image.foxxapp, .ui.button.signup', 'show')
    ;
    $('.ui.modal.email.foxxapp')
      .parent().css({"margin":"0"})
    ;

    //hacer funcionar el acordion en la seccion de ayuda.
    $('.ui.accordion')
      .accordion()
    ;

    //Abrir y cerrar la seccion de Ayuda.
    $('.help.icon').parent().click(function(){
      //Accion al hacer click en boton de ayuda principal
      $('.ui.celled.grid.content').hide();                //Ocultar Seccion Principal
      $('.ui.message.help').removeClass('hidden');        //Mostrar Seccion de Ayuda
      
      //Accion al hacer click en el boton ayuda de menu de la izquierda
      $('.menu.sidebar._left').sidebar('hide');           //Remover menu sidebar de la izquierda al abrir session de ayuda

      //Accion al hacer click en el boton ayuda de menu de la izquierda - DENTRO DEL LECTOR DE DOCUMENTOS
      $(".ui.inverted.menu_principal").show();
      $(".ui.celled.grid.viewer").hide();
      $(".ui.celled.grid.viewer iframe").remove()
      $(".ui.menu.fixed_buttom").hide();
      $('.menu.sidebar._top')
        .sidebar('hide')
      ;
    });

    //Cerrar session de ayuda desde el boton de retroceder dentro de la session o dentro del lector de documentos
    $('.reply.mail.help, .active.home.icon').parent().click(function(){
        //Accion al hacer click en boton retry de la seccion de ayuda
        $('.ui.celled.grid.content').show();
        $('.ui.message.help').addClass('hidden');
        
        //Accion al hacer click en el boton home de menu de la izquierda
        $('.menu.sidebar._left').sidebar('hide');           //Remover menu sidebar de la izquierda

        //Accion al hacer click en el boton home de menu de la izquierda - DENTRO DEL LECTOR DE DOCUMENTOS
        $(".ui.inverted.menu_principal").show();
        $(".ui.celled.grid.viewer").hide();
        $(".ui.celled.grid.viewer iframe").remove()
        $(".ui.menu.fixed_buttom").hide();
        $('.menu.sidebar._top')
          .sidebar('hide')
        ;
    });

    //Abrir el enlace de microsoft desde la seccion de ayuda sin salirse de la aplicacion
    $(".externa_url").click(function(){
      var url = $(this).attr("url");
      new MozActivity({
        name: "externa_url",
          data: {
              type: "url", // Possibly text/html in future versions
              url: url
          },
      });
    });
  })
;