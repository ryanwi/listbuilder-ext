var tweetSelector = "ol.stream-items>li[data-item-type='tweet']";

if (typeof jQuery === 'undefined') {
  console.error("no jquery");
} else {
  $(document).ready(function () {

    // popup action area to process selections
    $selectAll = $("<button>Select all</button>").on("click", selectAll);
    $deselectAll = $("<button>DeselectAll all</button>").on("click", deselectAll);
    $lists = $("<select><option> - Select a List - </option></select>");

    $("div#timeline")
    .prepend(
      $("<div class='twlistbuilder-actions'>")
      .append("<h1>Twitter List Builder</h1>")
      .append($selectAll)
      .append($deselectAll)
      .append($lists)
      );

    // wire up selection, treat single selection as multiple selection:
    // http://stackoverflow.com/questions/4396042/implement-multiple-selects-with-jquery-ui-selectable
    $(tweetSelector).on("onmousedown", function(e) {
      e.metaKey = true;
    }).selectable({
      selected: function( event, ui ) {
        var screen_name = $(this).children("div.tweet").data("screen-name");

        // show a checkmark when selected
        // console.log( $(this).find("a.account-group>img.avatar") );
        // $(this).find("a.account-group>img.avatar").css(
        //   "background-image",
        //   "url('chrome-extension://__MSG_@@extension_id__/images/checkmark-circled.png)"
        // );
      }
    });
  });
}

function selectAll() {
  $(tweetSelector).addClass('ui-selected');
}

function deselectAll() {
  $(tweetSelector).removeClass('ui-selected');
}
