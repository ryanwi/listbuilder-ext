(function( $ ) {

  var tweetSelector = "ol.stream-items>li[data-item-type='tweet']";
  var $selectLists = $("<select id='#twlistbuilder_lists'><option value='-1'> - Select a List - </option></select>");
  var $btnAddMembers = $("<button type='button' class='btn'>Include selected users in list</button>").on("click", addToList);
  var $btnToggleAll = $("<button type='button' class='btn'>Select All</button>").on("click", toggleAll);

  $(document).ready(function () {
    console.log("ready");

    // popup action area to process selections
    $("div#timeline")
    .prepend(
      $("<div class='twlistbuilder-actions'>")
      .append("<h1>Twitter List Builder</h1>")
      .append($selectLists)
      .append($btnAddMembers)
      .append($btnToggleAll)
      );
    loadLists();

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

  var selectAllOn = false;
  function toggleAll() {
    if (selectAllOn) {
      $(tweetSelector).removeClass('ui-selected');
      selectAllOn = false;
    } else {
      $(tweetSelector).addClass('ui-selected');
      selectAllOn = true;
    }
    $btnToggleAll.text(selectAllOn ? "Clear All" : "Select All");
  }

  function addToList(e) {
    // get selected list
    var selectedListId = $selectLists.val();
    if (selectedListId == "-1") {
      alert("Please select a list.");
      return;
    }

    // collect selected users
    var user_ids = [];
    var selected = $("div.tweet.ui-selectee.ui-selected");
    selected.each(function (index, element) {
      user_ids.push($(element).data("user-id"));
    });

    console.log(user_ids);
    if (user_ids.length == 0) {
      alert("Please select at least one tweet.");
      return;
    }

    // /i/user_id/lists/list_id/members
    $auth_token = $("input[type='hidden'][name='authenticity_token']").first().val();
    $.each(user_ids, function(index, user_id) {
      $.post("/i/" + user_id + "/lists/" + selectedListId + "/members",
        { authenticity_token: $auth_token },
        function (data) {
          console.log("Added to list");
        });
    });
  }

  function loadLists() {
    // grab any userid
    var userId = "783214"; // @twitter
    var jqxhr = $.getJSON( "/i/" + userId + "/lists", function( data ) {

      // populate select list from response
      var $lists = $(data.html).filter("ul.list-membership-container").children("li");
      $lists.each(function (index, element) {
        var listId = $(element).data("list-id");
        var listName = $(element).text();
        $selectLists.append($("<option>", { value: listId, text: listName }));
      });

    });
  }

})( jQuery );
