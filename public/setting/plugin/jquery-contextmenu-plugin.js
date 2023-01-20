/*jquery-contextmenu-plugin.js*/
(function ( $ ) {
  $.fn.contextmenu = function( options ) {

    var settings = $.extend({
      menuItems = [];
    }, options );

    let $this = this;
    let containerFrame = $('<table width="100%" border="0" cellspacing="0" cellpadding="2"></table>');
    let containerStyle = {'display': 'none', 'position': 'absolute', 'border': '1px solid black', 'border-radius': '3px', 'min-width': '200px', 'background-color': 'white', 'box-shadow': '10px 10px 5px #888888'};
    let iconStyle = {width: '40px', height: 'auto'};

    const doAddMenuItem = function(item) {
      let itemRow = $('<tr></tr>');
      $(itemRow).hover(()=>{
        $(itemRow).css({'cursor': 'pointer', 'background-color': '#2579B8', 'color': 'white'});
      });
      $(itemRow).on('click', (evt)=>{
        item.callback();
      });
      let iconCmd = $('<img/>').attr('src', item.iconUrl).css(iconStyle);
      let iconCol = $('<td width="50px" align="center"></td>').append($(iconCmd));
      let displayTextCol = $('<td width="*" align="left"></td>').text(item.displayText);
      $(itemRow).append($(iconCol)).append($(displayTextCol));
      $(containerFrame).append($(itemRow));
    }

    const init = function() {
      /*
      let containerBox = $('<div></div>');
      $(containerBox).css(containerStyle);
      */
      if (settings.menuItems.length > 0) {
        for (let i=0; i<settings.menuItems.length; i++) {
          let menuItem = settings.menuItems[i];
          doAddMenuItem(menuItem);
        }
      }
      /*
      return $(containerBox).append($(containerFrame));
      */
      return $(containerFrame);
    }

    let container = init();
    this.append($(container));

    let output = {
      menuStyle: containerStyle,
      addNewItem: doAddMenuItem
    }

    return output;
  }
}( jQuery ));
