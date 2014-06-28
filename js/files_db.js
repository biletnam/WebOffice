var WebOffice = function() {
    //private members
    var db = null,
        name = null,
        version = null,
        trace = function(msg) {
            //Traces
            console.log(msg);
        },
        init = function(dbname, dbversion) {
            //1.Initialize variables
            name = dbname;
            version = dbversion;

            //2. Make indexedDB compatible
            if (compatibility()) {

                //2.1 Delete database
                //deletedb("WebOffice");
                //3.Open database
                open();
            }
        },
        compatibility = function() {

            trace("window.indexedDB: " + window.indexedDB);
            trace("window.mozIndexedDB: " + window.mozIndexedDB);
            trace("window.webkitIndexedDB: " + window.webkitIndexedDB);
            trace("window.msIndexedDB: " + window.msIndexedDB);

            window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

            trace("window.IDBTransaction: " + window.IDBTransaction);
            trace("window.webkitIDBTransaction: " + window.webkitIDBTransaction);
            trace("window.msIDBTransaction: " + window.msIDBTransaction);

            window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || window.OIDBTransaction;

            trace("window.IDBKeyRange: " + window.IDBKeyRange);
            trace("window.webkitIDBKeyRange: " + window.webkitIDBKeyRange);
            trace("window.msIDBKeyRange: " + window.msIDBKeyRange);

            window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

            if (window.indexedDB) {
                trace('activada')
                return true;
            }

            trace("Your browser does not support a stable version of IndexedDB.");
            return false;

        },
        deletedb = function(dbname) {
            trace("Delete " + dbname);

            var request = window.indexedDB.deleteDatabase(dbname);

            request.onsuccess = function() {
                trace("Database " + dbname + " deleted!");
            };

            request.onerror = function(event) {
                trace("deletedb(); error: " + event);
            };
        },
        open = function() {
            //3.1. Open a database async
            
            var request = window.indexedDB.open("weboffice", version);

            //3.2 The database has changed its version (For IE 10 and Firefox)
            request.onupgradeneeded = function(event) {

                trace("Upgrade needed!");

                db = event.target.result;

                modifydb(); //Here we can modify the database
            };

            request.onsuccess = function(event) {
                trace("Database opened");

                db = event.target.result;

                //3.2 The database has changed its version (For Chrome)
                if (version != db.version && window.webkitIndexedDB) {

                    trace("version is different");

                    var setVersionreq = db.setVersion(version);

                    setVersionreq.onsuccess = modifydb; //Here we can modify the database
                }

                trace("Let's paint");
                items(); //4. Read our previous objects in the store (If there are any)
            };

            request.onerror = function(event) {
                trace("Database error: " + event);
            };
        },
        modifydb = function() {
            //3.3 Create / Modify object stores in our database 
            //2.Delete previous object store
            if (db.objectStoreNames.contains("files")) {
                db.deleteObjectStore("files");
                trace("db.deleteObjectStore('files');");
            }

            //3.Create object store
            var store = db.createObjectStore("files", {
                keyPath: "timeStamp"
            });


        },        
        add = function(filename,blob,timeStamp) {
            //4. Add objects
            trace("add();");

            var trans = db.transaction(["files"], "readwrite"),
                store = trans.objectStore("files");
            var data = {
                filename: filename,
                blob: blob,
                "timeStamp": timeStamp
            };
            var request = store.add(data);

            request.onsuccess = function(event) {
                trace("file added!");
                items(true); //5 Read items after adding
            };
        },
        items = function(add,remove) {
            //5. Read
            trace("items(); called");

            if (add != true && remove != true){
                var list = $('.ui.inbox.list'),
                trans = db.transaction(["files"], "readonly"),
                store = trans.objectStore("files");

                list.html('');
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function(event) {
                    trace("Cursor opened!");

                    var result = event.target.result;

                    if (result === false || result === null){
                        $('.remove.icon').click(function(){
                            del(parseInt($(this).attr('timestamp')));
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
                        return;
                    }
                        
                    render(result.value); //4.1 Create HTML elements for this object
                    result.continue ();
                };
            }
        },
        render = function(item) {
            //5.1 Create DOM elements
            trace("Render items");

            ultimo = item.filename.split("/").pop();
            pdf = ultimo.charAt(0).toUpperCase() + ultimo.slice(1);
            formato = ultimo.split(".")[1]
            if(formato == "odt"){
              $('.ui.inbox.list.odt').append(''+
                '<a id="'+item.blob+'" class="item ui pdf">'+
                  '<i timestamp="'+item.timeStamp+'" class="remove icon big right floated"></i>'+
                  '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
                  '<div class="content">'+
                    '<div class="header">' + pdf + '</div>'+
                    item.filename+
                  '</div>'+
                '</a>'
              );
            }else if(formato == "odp"){
              $('.ui.inbox.list.odp').append(''+
                '<a id="'+item.blob+'" class="item ui pdf">'+
                  '<i timestamp="'+item.timeStamp+'" class="remove icon big right floated"></i>'+
                  '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
                  '<div class="content">'+
                    '<div class="header">' + pdf + '</div>'+
                    item.filename+
                  '</div>'+
                '</a>'
              );
            }else if(formato == "ods"){          
              $('.ui.inbox.list.ods').append(''+
                '<a id="'+item.blob+'" class="item ui pdf">'+
                  '<i timestamp="'+item.timeStamp+'" class="remove icon big right floated"></i>'+
                  '<i class="icon large"><img class="ui image" src="./images/'+formato+'.png"></i>'+
                  '<div class="content">'+
                    '<div class="header">' + pdf + '</div>'+
                    item.filename+
                  '</div>'+
                '</a>'
              );
            }
        },
        del = function(timeStamp) {
            //6. Delete items
            var transaction = db.transaction(["files"], "readwrite");
            var store = transaction.objectStore("files");
            var request = store.delete(timeStamp);

            request.onsuccess = function(event) {
                trace("Item deleted!");
                items(true); //5.1 Read items after deleting
            };

            request.onerror = function(event) {
                trace("Error deleting: " + e);
            };
        };

    //public members
    return {
        init: init,
        add: add,
        del: del,
        items: items
    };
};