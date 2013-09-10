(function() {
  var commentTemplate, displayAlert, generateResultTemplate, paginationTemplate, query, registerPaginationClickEvent, search_custom_button, search_results, search_results_alert, search_user_check_display, username, _comments;

  _comments = void 0;

  query = void 0;

  username = void 0;

  search_results = void 0;

  search_results_alert = void 0;

  search_user_check_display = void 0;

  search_custom_button = void 0;

  $(document).ready(function() {
    Handlebars.registerHelper('paginate', paginate);
    query = $("#search_custom_text");
    username = $("#search_username");
    search_results = $("#search_results");
    search_results_alert = $("#search_results_alert");
    search_user_check_display = $("#search_user_check_display > span");
    search_custom_button = $("#search_custom_button");
    $("#search_username").keyup(function() {
      var classes, html;
      html = "";
      classes = "";
      if (this.value.length > 2) {
        html = "<img src=\"/img/ajax-spinner.gif\" />";
        classes = "label round secondary";
        $.getJSON("/check_user/" + (encodeURIComponent(this.value)), function(data) {
          if (data.found === true) {
            html = "<b>&#x2714;</b>";
            classes = "label round success";
          } else if (data.found === false) {
            html = "<b>&#x2717;</b>";
            classes = "label round alert";
          } else {
            html = "<b>Err</b>";
            classes = "label round secondary";
          }
          search_user_check_display.html(html);
          return search_user_check_display.attr("class", classes);
        });
      } else {
        html = "<b>?</b>";
        classes = "label round secondary";
      }
      search_user_check_display.html(html);
      return search_user_check_display.attr("class", classes);
    });
    query.keyup(function(e) {
      if (e.keyCode === 13) {
        return search_custom_button.click.apply(search_custom_button);
      }
    });
    search_custom_button.click(function() {
      if (search_results_alert.is(":visible")) {
        search_results_alert.hide();
      }
      if (query.val().length > 0 && username.val().length > 2) {
        search_custom_button.addClass("disabled");
        search_custom_button.text("Searching...");
        search_results.html("<img class=\"loading_bar\" src=\"img/loading-bar.gif\" />");
        return $.getJSON("/search/" + (encodeURIComponent(username.val())) + "/" + (encodeURIComponent(query.val())), function(data) {
          if (data.success) {
            if (data.comments.length > 0) {
              _comments = data.comments;
              search_results.html(generateResultTemplate(data.comments));
              registerPaginationClickEvent();
            } else {
              search_results.html("");
              displayAlert("No results found");
            }
          } else {
            search_results.html("");
            displayAlert("<b>Error:</b> " + data.error, "alert");
          }
          search_custom_button.text("Search");
          return search_custom_button.removeClass("disabled");
        });
      }
    });
    username.focus();
    return $("#search_custom_clear_button").click(function() {
      if (search_results.children().length > 0) {
        search_results.empty();
      }
      query.focus();
      return query.select();
    });
  });

  displayAlert = function(msg, type) {
    var message;
    if (msg != null) {
      message = search_results_alert.children("span.message");
      message.html(msg);
      if (type != null) {
        search_results_alert.addClass(type);
      }
      return search_results_alert.show();
    }
  };

  registerPaginationClickEvent = function() {
    return $(".paginate_link").click(function() {
      var pageNum;
      if (_comments != null) {
        pageNum = this.dataset.pagenumber;
        search_results.html(generateResultTemplate(_comments, pageNum));
        return registerPaginationClickEvent();
      } else {
        return console.log("No comments to paginate!");
      }
    });
  };

  generateResultTemplate = function(comments, currentPage, itemsPerPage) {
    var begin, currentItem, end, pageCount, template;
    template = Handlebars.compile(commentTemplate);
    if ((itemsPerPage == null) || itemsPerPage < 1) {
      itemsPerPage = 3;
    }
    if ((currentPage == null) || currentPage < 1) {
      currentPage = 1;
    }
    pageCount = Math.ceil(comments.length / itemsPerPage);
    currentItem = (currentPage * itemsPerPage) < comments.length ? currentPage * itemsPerPage : comments.length;
    begin = currentItem - itemsPerPage >= 0 ? currentItem - itemsPerPage : 0;
    end = currentItem;
    comments = comments.slice(begin, end);
    return template({
      comments: comments,
      pagination: {
        page: currentPage,
        pageCount: pageCount
      }
    });
  };

  Handlebars.registerHelper('split', function(text, splitter, which) {
    var pieces;
    if (text == null) {
      return "";
    }
    pieces = text.split(splitter);
    which = parseInt(which);
    if ((which != null) && ((-1 < which && which < pieces.length))) {
      return pieces[which];
    }
    return pieces;
  });

  paginationTemplate = "<div class=\"pagination pagination-centered\">\n  <ul>\n    {{#paginate pagination type=\"previous\"}}\n      <li class=\"arrow{{#if disabled}} unavailable{{/if}}\">\n        <a href=\"#\" data-pagenumber=\"{{n}}\" data-pageoperation=\"prev\" class=\"paginate_link\" >Prev</a>\n      </li>\n    {{/paginate}}\n    {{#paginate pagination type=\"middle\" limit=\"7\"}}\n      <li{{#if active}} class=\"current\"{{/if}}>\n        <a href=\"#\" data-pagenumber=\"{{n}}\" data-pageoperation=\"mid\" class=\"paginate_link\">{{n}}</a>\n      </li>\n    {{/paginate}}\n    {{#paginate pagination type=\"next\"}}\n      <li class=\"arrow{{#if disabled}} unavailable{{/if}}\">\n        <a href=\"#\" data-pagenumber=\"{{n}}\" data-pageoperation=\"next\" class=\"paginate_link\">Next</a>\n      </li>\n    {{/paginate}} \n  </ul>\n</div>";

  commentTemplate = paginationTemplate + "{{#each comments}}\n  <div class='row panel comment_well'>\n    <div class='row'>\n      <div class='large-12 columns comment_body'>\n        {{body}}\n      </div>\n    </div>\n    <hr />\n    <div class='row comment_footer'>\n        <div class='large-8 columns comment_author'>\n          - {{author}}\n        </div>\n        <div class='large-4 columns comment_links'>\n          <a href='http://reddit.com/comments/{{split link_id \"_\" 1}}/_/{{id}}' target='_blank'>View on Reddit</a>\n        </div>\n    </div>\n  </div>\n{{/each}}" + paginationTemplate;

}).call(this);

/*
//@ sourceMappingURL=main.js.map
*/
