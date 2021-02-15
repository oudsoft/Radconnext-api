/*feeder.js */

(function($) {
  var origAppend = $.fn.append;

  $.fn.append = function () {
    return origAppend.apply(this, arguments).trigger("append");
  };

  $.fn.feeder = function( options ) {
    var settings = $.extend({
      onActionCallback: undefined,
      offActionCallback: undefined
    }, options );

    const $this = this;

    this.bind("append", function() { $.notify('Hello, world!', 'success'); });

    const init = function() {
      let helloBox = $('<span>Hello everybody.</span>');
      return $(helloBox);
    }

    /*
    pluginOption {
    }
    */

    const hello = init();
    this.append($(hello));


    /* public method of plugin */
    var output = {
      settings: settings,
      handle: this,
    }

    return output;

  };


})(jQuery);


const myBox = $('<div class="hello"></div>');

$(myBox).feeder({test: 'test'});
