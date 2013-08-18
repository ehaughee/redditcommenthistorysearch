var _comments;

$(document).ready(function() {
	// Register pagination handlebars helper
	Handlebars.registerHelper('paginate', paginate);

	// Username existance check while typing
	var search_user_check_display = $("#search_user_check_display > span");
	$("#search_username").keyup(function() {
		// TODO: Debounce this
		if (this.value.length > 2) {

			// TODO: Show working gif
			search_user_check_display.html('<img src="/img/ajax-spinner.gif" />');
			search_user_check_display.attr("class", "label round secondary");

			$.getJSON('/check_user/' + encodeURIComponent(this.value), function(data) {
				if (data.found === true) {
					search_user_check_display.html("<b>&#x2714;</b>");
					search_user_check_display.attr("class", "label round success");
				} else if (data.found === false) {
					search_user_check_display.html("<b>&#x2718;</b>");
					search_user_check_display.attr("class", "label round alert");
				} else {
					// Display nothing/error
					search_user_check_display.html("<b>Err</b>");
					search_user_check_display.attr("class", "label round alert");
				}
			});
		}
		else {
			search_user_check_display.html("?");
			search_user_check_display.attr("class", "label round secondary");
		}
	});

	// Search button for custom search was clicked
	var text = $("#search_custom_text");
	var user = $("#search_username");
	var search_results = $("#search_results");
	var search_results_alert = $("#search_results_alert");

	$("#search_custom_button").click(function() {
		search_results_alert.hide();
		if (text.val().length > 0 && user.val().length > 2) {
			this.className += "disabled";
			this.innerText = "Searching....";
			var that = this;

			$.getJSON('/search/' + user.val() + '/' + encodeURIComponent(text.val()),
				function(data) {
					if (data.success) {
						if (data.comments.length > 0) {
							_comments = data.comments;
							search_results.html(generateResultTemplate(data.comments));
							registerPaginationClickEvent();
						}
						else {

							displayAlert("No results found");
						}
					}
					else {
						displayAlert("<b>Error: </b>" + data.error, "error");
					}

					that.innerText = "Search";
					that.className = that.className.replace(/\bdisabled\b/,'');
				}
			);
		}
	});

	$("#search_custom_clear_button").click(function () {
		if (search_results.children().length > 0) {
			search_results.empty();
		}
	});

	function displayAlert(msg, type) {
		if (msg !== "") {
			var message = search_results_alert.children("span.message");
			message.text(msg);

			if (type === "error") {
				search_results_alert.addClass("alert");
			}

			search_results_alert.show();
		}
	}

	function registerPaginationClickEvent() {
		$(".paginate_link").click(function() {
			if (typeof _comments !== "undefined") {
				var pageNum = this.dataset.pagenumber;
				search_results.html(generateResultTemplate(_comments, pageNum));
				registerPaginationClickEvent();
			}
			else {
				console.log("No comments to paginate!");
			}
		});

		// var activePageElem = $("li.active");
		// activePageElem.html(activePageElem.children("a").text());

		// var disabledPageElem = $("li.disabled");
		// disabledPageElem.html(disabledPageElem.children("a").text());		
	}

	function generateResultTemplate(comments, currentPage, itemsPerPage) {
		var template = Handlebars.compile(commentTemplate);
		if (typeof itemsPerPage === "undefined" || itemsPerPage < 1) { itemsPerPage = 3 }
		if (typeof currentPage === "undefined" || currentPage < 1) { currentPage = 1 }


		var pageCount = Math.ceil(comments.length/itemsPerPage);
		var currentItem = ((currentPage * itemsPerPage) < comments.length) 
							? (currentPage * itemsPerPage)
							: comments.length;
		
		var begin = (currentItem - itemsPerPage >= 0) ? currentItem - itemsPerPage : 0;
		var end = currentItem;
		
		comments = comments.slice(begin, end);

		return template({
					comments: comments,
					pagination: {
						page: currentPage,
						pageCount: pageCount
					}
				});
	}
});

Handlebars.registerHelper('split', function(text, splitter, which) {
	if (typeof text === "undefined") {
		return "";
	}

	var pieces = text.split(splitter);
	which = parseInt(which);
	if (typeof which !== "undefined" && which !== NaN && which < pieces.length) {
		return pieces[which];
	}
	return pieces;
});

// ===========================================
// ================ Templates ================
// ===========================================
var paginationTemplate = [
	'<div class="pagination pagination-centered">',
	'<ul>',
	'{{#paginate pagination type="previous"}}',
	'<li class="arrow{{#if disabled}} unavailable{{/if}}"><a href="#" data-pagenumber="{{n}}" data-pageoperation="prev" class="paginate_link" >Prev</a></li>',
	'{{/paginate}}',
	'{{#paginate pagination type="middle" limit="7"}}',
	'<li {{#if active}}class="current"{{/if}}><a href="#" data-pagenumber="{{n}}" data-pageoperation="mid" class="paginate_link">{{n}}</a></li>',
	'{{/paginate}}',
	'{{#paginate pagination type="next"}}',
	'<li class="arrow{{#if disabled}} unavailable{{/if}}"><a href="#" data-pagenumber="{{n}}" data-pageoperation="next" class="paginate_link">Next</a></li>',
	'{{/paginate}}',
	'</ul>',
	'</div>'
].join('\n');

// http://www.reddit.com/comments/{post id}/{slug}/{comment id}
var commentTemplate = [
	"{{#each comments}}",
	"<div class='row panel comment_well'>",
	"<div class='row'>",
	"<div class='large-12 columns comment_body'>",
	"{{body}}",
	"</div>",
	"</div>",
	"<hr />",
	"<div class='row comment_footer'>",
	"<div class='large-8 columns comment_author'>",
	"- {{author}}",
	"</div>",
	"<div class='large-4 columns comment_links'>",
	"<a href='http://reddit.com/comments/{{split link_id \"_\" 1}}/_/{{id}}' target='_blank'>View on Reddit</a>",
	"</div>",
	"</div>",
	"</div>",
	"{{/each}}"
].join('\n') + paginationTemplate;


