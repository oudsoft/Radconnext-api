/*jquery-report-element-plugin.js */
(function ( $ ) {
  $.fn.textelement = function( options ) {

    let settings = $.extend({
      // These are the defaults.
      elementType: 'text',
      type: "static",
      x: 0,
      y: 0,
      width: '140',
      height: '40',
      fontsize: 20,
      fontweight: 'normal',
      fontstyle: 'normal',
      fontalign: 'left',
      refresh: function() {
        let elementData = {options: settings};
        $this.resizable('destroy');
        $this.draggable('destroy');
        $this.css({"left": settings.x + "px", "top": settings.y + "px", "width": settings.width + "px", "height": settings.height + "px"});
        $this.text(settings.title);
        $this.resizable({
          containment: "parent",
          stop: function(evt) {
            elementResizeStopEvt(evt, elementData);
          }
        });
        $this.draggable({
          containment: "parent",
          stop: function(evt) {
            elementDragStopEvt(evt, elementData);
          }
        });
      }
    }, options );

    let $this = this;

    const doCreatetextElement = function(){
      let element = $this
      let elementData = {options: settings};
      $(element).data( "custom-textelement", elementData );
      $(element).addClass("ui-widget-content");
      $(element).addClass("reportElement");
      $(element).addClass("textElement");
      $(element).css({
        "left": settings.x + "px",
        "top": settings.y + "px",
        "width": settings.width + "px",
        "height": settings.height + "px"});
      $(element).text(settings.title);
      $(element).draggable({
        containment: "parent",
        stop: function(evt) {
          elementDragStopEvt(evt, elementData);
        }
      });
      $(element).resizable({
        containment: "parent",
        stop: function(evt) {
          elementResizeStopEvt(evt, elementData);
        }
      });
      $(element).on('click', function(evt, ui) {
        settings.elementselect(evt, elementData);
      });

      return $(element);
    }

    const setOption = function(key, value){
      settings[key] = value;
    }

    const elementResizeStopEvt = function(evt, ui) {
      setOption("width", evt.target.clientWidth);
      setOption("height", evt.target.clientHeight);
      let elementData = $(evt.target).data('custom-textelement');
      settings.elementresizestop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const elementDragStopEvt = function(evt, ui) {
      setOption("x", evt.target.offsetLeft);
      setOption("y", evt.target.offsetTop);
      let elementData = $(evt.target).data('custom-textelement');
      settings.elementdrop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const init = function() {
      let textElement = doCreatetextElement();
      return $(textElement);
    }

    const textElement = init();
    this.append($(textElement));
    $(textElement).resizable({
      containment: "parent",
      stop: elementResizeStopEvt
    });

    /* public method of plugin */
    var output = {
      settings: $this.settings,
      elementHandle: textElement,
    }

    return output;

  };

  $.fn.hrelement = function( options ) {

    let settings = $.extend({
      // These are the defaults.
      elementType: 'hr',
      x: 0,
      y: 0,
      width: '100%',
      height: '20',
      border: "1px solid black;",
      refresh: function() {
        let elementData = {options: settings};
        $this.resizable('destroy');
        $this.draggable('destroy');
        $this.css({"left": settings.x + "px", "top": settings.y + "px", "width": settings.width + "px", "height": settings.height + "px"});
        $this.resizable({
          containment: "parent",
          stop: function(evt) {
            elementResizeStopEvt(evt, elementData);
            settings.refresh();
          }
        });
        $this.draggable({
          containment: "parent",
          stop: function(evt) {
            elementDragStopEvt(evt, elementData);
            settings.refresh();
          }
        });
      }
    }, options );

    let $this = this;
    const doCreatehrElement = function(){
      let element = $this
      let elementData = {options: settings};
      $(element).data( "custom-hrelement", elementData );
      $(element).addClass("ui-widget-content");
      $(element).addClass("reportElement");
      $(element).addClass("hrElement");
      $(element).css({
        "left": settings.x + "px",
        "top": settings.y + "px",
        "width": settings.width + "px",
        "height": settings.height + "px"});
      $(element > "hr").css({"border": settings.border});
      $(element).draggable({
        containment: "parent",
        stop: function(evt) {
          elementDragStopEvt(evt, elementData);
          settings.refresh();
        }
      });
      $(element).resizable({
        containment: "parent",
        stop: function(evt) {
          elementResizeStopEvt(evt, elementData);
          settings.refresh();
        }
      });

      $(element).on('click', function(evt, ui) {
        settings.elementselect(evt, elementData);
      });

      return $(element);
    }

    const setOption = function(key, value){
      settings[key] = value;
    }

    const elementResizeStopEvt = function(evt, ui) {
      setOption("width", evt.target.clientWidth);
      setOption("height", evt.target.clientHeight);
      let elementData = $(evt.target).data('custom-hrelement');
      settings.elementresizestop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const elementDragStopEvt = function(evt, ui) {
      setOption("x", evt.target.offsetLeft);
      setOption("y", evt.target.offsetTop);
      settings.refresh();
      let elementData = $(evt.target).data('custom-hrelement');
      settings.elementdrop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const init = function() {
      let hrElement = doCreatehrElement();
      return $(hrElement);
    }

    const hrElement = init();
    this.append($(hrElement));
    $(hrElement).resizable({
      containment: "parent",
      stop: elementResizeStopEvt
    });

    /* public method of plugin */
    var output = {
      settings: $this.settings,
      elementHandle: hrElement,
    }

    return output;

  };

  $.fn.imageelement = function( options ) {

    let settings = $.extend({
      // These are the defaults.
      elementType: 'image',
      x: 0,
      y: 0,
      width: '100',
      height: '80'
    }, options );

    let $this = this;
    const doCreateimageElement = function(){
      let element = $this;
      let elementData = {options: settings};
      $(element).data( "custom-imageelement", elementData );
      $(element).addClass("ui-widget-content");
      $(element).addClass("reportElement");
      $(element).addClass("imageElement");
      $(element).css({
        "left": settings.x + "px",
        "top": settings.y + "px",
        "width": settings.width + "px",
        "height": "auto"
      });
      let newImage = new Image();
      newImage.src = settings.url;
      newImage.setAttribute("width", settings.width);
      $(element).append(newImage);
      $(element).draggable({
        containment: "parent",
        stop: function(evt) {
          elementDragStopEvt(evt, elementData);
          settings.refresh();
        }
      });
      $(element).resizable({
        containment: "parent",
        stop: function(evt) {
          elementResizeStopEvt(evt, elementData);
          settings.refresh();
        }
      });
      settings.refresh = function() {
        $this.resizable('destroy');
        $this.draggable('destroy');
        $this.empty();
        let newImage = new Image();
        newImage.src = settings.url;
        newImage.setAttribute("width", settings.width);
        $this.append(newImage);
        $this.css({"left": settings.x + "px", "top": settings.y + "px", "width": settings.width, "height": "auto"});
        $this.resizable({
          containment: "parent",
          stop: function(evt) {
            elementResizeStopEvt(evt, elementData);
            settings.refresh();
          }
        });
        $this.draggable({
          containment: "parent",
          stop: function(evt) {
            elementDragStopEvt(evt, elementData);
            settings.refresh();
          }
        });
      }

      $(element).on('click', function(evt, ui) {
        settings.elementselect(evt, elementData);
      });

      return $(element);
    }
    const setOption = function(key, value){
      settings[key] = value;
    }

    const elementResizeStopEvt = function(evt, ui) {
      setOption("width", evt.target.clientWidth);
      setOption("height", evt.target.clientHeight);
      let elementData = $(evt.target).data('custom-imageelement');
      settings.elementresizestop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const elementDragStopEvt = function(evt, ui) {
      setOption("x", evt.target.offsetLeft);
      setOption("y", evt.target.offsetTop);
      settings.refresh();
      let elementData = $(evt.target).data('custom-imageelement');
      settings.elementdrop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const init = function() {
      let imageElement = doCreateimageElement();
      return $(imageElement);
    }

    const imageElement = init();
    this.append($(imageElement));
    $(imageElement).resizable({
      containment: "parent",
      stop: elementResizeStopEvt
    });

    /* public method of plugin */
    var output = {
      settings: $this.settings,
      elementHandle: imageElement,
    }

    return output;
  };

  $.fn.tableelement = function( options ) {

    let settings = $.extend({
      // These are the defaults.
      elementType: 'hr',
      x: 0,
      y: 0,
      width: '100%',
      height: '20',
      border: "1px solid black;",
      refresh: function() {
        let elementData = {options: settings};
        $this.resizable('destroy');
        $this.draggable('destroy');
        $this.css({"left": settings.x + "px", "top": settings.y + "px", "width": settings.width + "px", "height": settings.height + "px"});
        $this.resizable({
          containment: "parent",
          stop: function(evt) {
            elementResizeStopEvt(evt, elementData);
            settings.refresh();
          }
        });
        $this.draggable({
          containment: "parent",
          stop: function(evt) {
            elementDragStopEvt(evt, elementData);
            settings.refresh();
          }
        });
      }
    }, options );

    let $this = this;

    const doCreateTableElement = function(){
      let element = $this
      let elementData = {options: settings};
      $(element).data( "custom-tableelement", elementData );
      $(element).addClass("ui-widget-content");
      $(element).addClass("reportElement");
      $(element).addClass("tableElement");
      $(element).css({
        "left": settings.x + "px",
        "top": settings.y + "px",
        "width": settings.width + "px",
        "height": settings.height + "px"});
      $(element).append($('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>'));
      $(element > "table").css({"border": settings.border});
      $(element).draggable({
        containment: "parent",
        stop: function(evt) {
          elementDragStopEvt(evt, elementData);
          settings.refresh();
        }
      });
      $(element).resizable({
        containment: "parent",
        stop: function(evt) {
          elementResizeStopEvt(evt, elementData);
          settings.refresh();
        }
      });

      $(element).on('click', function(evt, ui) {
        settings.elementselect(evt, elementData);
      });

      return $(element);
    }

    const setOption = function(key, value){
      settings[key] = value;
    }

    const elementResizeStopEvt = function(evt, ui) {
      setOption("width", evt.target.clientWidth);
      setOption("height", evt.target.clientHeight);
      let elementData = $(evt.target).data('custom-tableelement');
      settings.elementresizestop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const elementDragStopEvt = function(evt, ui) {
      setOption("x", evt.target.offsetLeft);
      setOption("y", evt.target.offsetTop);
      settings.refresh();
      let elementData = $(evt.target).data('custom-tableelement');
      settings.elementdrop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const init = function() {
      let tableElement = doCreateTableElement();
      return $(tableElement);
    }

    const tableElement = init();
    this.append($(tableElement));
    $(tableElement).resizable({
      containment: "parent",
      stop: elementResizeStopEvt
    });

    /* public method of plugin */
    var output = {
      settings: $this.settings,
      elementHandle: tableElement,
    }

    return output;

  };

  $.fn.trelement = function( options ) {

    let settings = $.extend({
      // These are the defaults.
      elementType: 'hr',
      /*
      x: 0,
      y: 0,
      width: '100%',
      height: '20',
      */
      border: "1px solid black;",
      backgroundColor: "#ddd",
      refresh: function() {
        let elementData = {options: settings};
        $this.resizable('destroy');
        $this.draggable('destroy');
        //$this.css({"left": settings.x + "px", "top": settings.y + "px", "width": settings.width + "px", "height": settings.height + "px"});
        $this.css({"border": settings.border, 'background-color': settings.backgroundColor});
        $this.resizable({
          containment: "parent",
          stop: function(evt) {
            elementResizeStopEvt(evt, elementData);
            settings.refresh();
          }
        });
        $this.draggable({
          containment: "parent",
          stop: function(evt) {
            elementDragStopEvt(evt, elementData);
            settings.refresh();
          }
        });
      }
    }, options );

    let $this = this;

    const doCreateTrElement = function(){
      let element = $this
      let elementData = {options: settings};
      $(element).data( "custom-trelement", elementData );
      $(element).addClass("ui-widget-content");
      $(element).addClass("reportElement");
      $(element).addClass("trElement");
      $(element).css(/*{
        "left": settings.x + "px",
        "top": settings.y + "px",
        "width": settings.width + "px",
        "height": settings.height + "px"}*/
      {'border': settings.border, 'background-color': settings.backgroundColor});
      //$(element).append($('<tr></tr>'));
      //$(element > "table").css({"border": settings.border});
      $(element).draggable({
        containment: "parent",
        stop: function(evt) {
          elementDragStopEvt(evt, elementData);
          settings.refresh();
        }
      });
      $(element).resizable({
        containment: "parent",
        stop: function(evt) {
          elementResizeStopEvt(evt, elementData);
          settings.refresh();
        }
      });

      $(element).on('click', function(evt, ui) {
        settings.elementselect(evt, elementData);
      });

      return $(element);
    }

    const setOption = function(key, value){
      settings[key] = value;
    }

    const elementResizeStopEvt = function(evt, ui) {
      //setOption("width", evt.target.clientWidth);
      //setOption("height", evt.target.clientHeight);
      let elementData = $(evt.target).data('custom-trelement');
      settings.elementresizestop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const elementDragStopEvt = function(evt, ui) {
      //setOption("x", evt.target.offsetLeft);
      //setOption("y", evt.target.offsetTop);
      settings.refresh();
      let elementData = $(evt.target).data('custom-trelement');
      settings.elementdrop(evt, elementData);
      $(evt.target).click();
      evt.preventDefault();
    }

    const init = function() {
      let trElement = doCreateTrElement();
      return $(trElement);
    }

    const trElement = init();
    this.append($(trElement));
    $(trElement).resizable({
      containment: "parent",
      stop: elementResizeStopEvt
    });

    /* public method of plugin */
    var output = {
      settings: $this.settings,
      elementHandle: trElement,
    }

    return output;

  };

}( jQuery ));
