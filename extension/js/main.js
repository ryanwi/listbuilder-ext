var listBuilder = function ($) {
  'use strict';

  var selectAllOn = false;
  var tweetSelector = "ol.stream-items>li[data-item-type='tweet']";
  var checkboxSelector = "input[type='checkbox'][name='twlistbuilder_tweet']";
  var $selectLists = $("<select id='twlistbuilder_lists'><option value='-1'> - Select a List - </option></select>");
  var $btnAddMembers = $("<button type='button' class='btn small'>Add to List</button>").on("click", addSelectedToList);
  var $btnToggleAll = $("<button type='button' class='btn small'>Select All</button>").on("click", toggleAll);

  // popup action area to process selected tweets
  function buildActionContainer() {
    if ($("#twlistbuilder-actions").length > 0) {
      console.log("already built");
      $("#twlistbuilder-actions").show();
      return;
    }

    $('body')
    .append(
      $("<div id='twlistbuilder-actions' style='position: fixed; top: 50px; right: 3px; z-index: 1000;width:196px;'>")
      .append("<h1>List Builder</h1>")
      .append("<div id='twlistbuilder-progress'><img src='https://abs.twimg.com/a/1394123900/img/t1/spinner.gif'>Loading Lists</div>")
      .append($("<div id='twlistbuilder-content'>")
      .append("<h4>Select individual tweets or:</h4>")
      .append($btnToggleAll)
      .append("<h4>Choose a list </h4>")
      .append($selectLists)
      .append($btnAddMembers)
      .append("<div id='twlistbuilder-notice'></div>")
      ));
    loadLists();
  }

  // wire up individual tweet selection capability
  function addCheckboxesToTweets() {
    var $tweetCheck = $("<input name='twlistbuilder_tweet' type='checkbox'>").on("change", onTweetSelected);
    $(tweetSelector).prepend($tweetCheck);
  }

  function removeCheckboxes() {
    $(checkboxSelector).remove();
  }

  // populate dropdown with user's lists
  function loadLists() {
    // grab any userid
    var anyUserId = "783214"; // @twitter

    // call the internal list endpoint, testing against any user
    var jqxhr = $.getJSON("/i/" + anyUserId + "/lists", function(data) {
      var $lists = $(data.html).filter("ul.list-membership-container").children("li");
      if ($lists.length == 0) {
        $("#twlistbuilder-progress").text("It appears you have no lists, press 'g' then 'l' (as in list) on the keyboard to go set one up.");
      } else {
        $lists.each(function (index, element) {
          var listId = $(element).data("list-id");
          var listName = $(element).text();
          $selectLists.append($("<option>", { value: listId, text: listName }));
        });

        $("#twlistbuilder-progress").hide();
        $("#twlistbuilder-content").show();
      }
    });
  }

  function toggleAll() {
    if (selectAllOn) {
      $(tweetSelector).removeClass('ui-selected');
      selectAllOn = false;
    } else {
      $(tweetSelector).addClass('ui-selected');
      selectAllOn = true;
    }
    $btnToggleAll.text(selectAllOn ? "Clear All" : "Select All");
    $(checkboxSelector).prop('checked', selectAllOn);
  }

  function onTweetSelected(e) {
    if ($(this).is(':checked')) {
      $(this).parent().addClass("ui-selected");
    } else {
      $(this).parent().removeClass("ui-selected");
    }
  }

  function addSelectedToList(e) {
    // get selected list
    var selectedListId = $selectLists.val();
    if (selectedListId === "-1") {
      alert("Please select a list.");
      return;
    }

    // collect selected users
    var userIds = getSelectedUserIds();
    if (userIds.length === 0) {
      alert("Please select at least one tweet.");
      return;
    }

    // fire off membership requests
    $btnAddMembers.attr("disabled", true);
    var $authToken = $("input[type='hidden'][name='authenticity_token']").first().val();

    // batch the ajax requests and update when done with all
    var promises = $.map( userIds, function( val, i ) {
      addListMember( val, selectedListId, $authToken );
    });
    $.when.apply($, promises).done(function() {
      selectAllOn = true;
      toggleAll();
      $btnAddMembers.attr("disabled", false);
      $("#twlistbuilder-notice").show().text("List updated!").fadeOut(3000);
    });
  }

  function getSelectedUserIds() {
    var userIds = [];
    var selected = $(tweetSelector + ".ui-selected div.tweet");
    selected.each(function (index, element) {
      userIds.push($(element).data("user-id"));
    });

    return userIds;
  }

  function addListMember(userId, selectedListId, authToken) {
    var url = "/i/" + userId + "/lists/" + selectedListId + "/members";
    return $.post(url, { authenticity_token: authToken }, null);
  }

  return {

    init: function() {
      // ensure a timeline is available
      if ($(tweetSelector).length === 0) {
        console.log("not on a timeline view");
        $("#twlistbuilder-actions").hide();
        return;
      }

      buildActionContainer();
      removeCheckboxes();
      addCheckboxesToTweets();
    },

  };

}(jQuery);

$(document).ready(function () {
  listBuilder.init();
});

// watch as page changes and new tweets come in
var observer = new MutationSummary({
  rootNode: document.getElementById("page-container"),
  callback: listBuilder.init,
  queries: [{ element: 'li[data-item-type=tweet]' }]
});
