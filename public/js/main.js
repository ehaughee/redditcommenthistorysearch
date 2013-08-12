var _comments;

$(document).ready(function() {
	// Register pagination handlebars helper
	Handlebars.registerHelper('paginate', paginate);

	// Username existance check while typing
	var elem = $("#search_user_check_display");
	$("#search_username").keyup(function() {
		// TODO: Debounce this
		if (this.value.length > 2) {

			// TODO: Show working gif
			elem.html('<img src="/img/ajax-spinner.gif" />');

			$.getJSON('/check_user/' + this.value, function(data) {
				if (data.found === true) {
					// TODO: Display checkmark
					elem.html("<b>&#x2714;</b>");
				} else if (data.found === false) {
					// TODO: Display X
					elem.html("<b>&#x2718;</b>");
				} else {
					// Display nothing/error
					elem.html("<b>!!</b>");
				}
			});
		}
		else {
			elem.html("");
		}
	});

	// Search button for custom search was clicked
	var text = $("#search_custom_text");
	var user = $("#search_username");
	var search_results = $("#search_results");
	$("#search_custom_button").click(function() {
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
							// TODO: DOMify this
							alert("No results found");
						}
					}
					else {
						// TODO: Display this error message on the DOM
						alert("Error " + data.error);
					}

					that.innerText = "Search";
					that.className = that.className.replace(/\bdisabled\b/,'');
				}
			);
		}
	});

	function registerPaginationClickEvent() {
		$(".paginate_link").click(function() {
			if (typeof _comments !== "undefined") {
				var pageNum = this.dataset.pagenumber;
				// switch(this.dataset.pageoperation) {
					// case "prev":
					// 	break;

					// case "mid":
						search_results.html(generateResultTemplate(_comments, pageNum));
						// break;

					// case "next";
					// 	break;
				// }
				
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


