$(document).ready(function() {
	// Register pagination handlebars helper
	Handlebars.registerHelper('paginate', paginate);

	// Username existance check while typing
	$("#search_username").keyup(function() {
		if (this.value.length > 2) {
			var elem = $("#search_user_check_display");
			elem.html("Working...");
			// TODO: Show working gif

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
	});

	// Search button for custom search was clicked
	$("#search_custom_button").click(function() {
		var text = $("#search_custom_text");
		var user = $("#search_username");
		if (text.val().length > 0 && user.val().length > 2) {
			this.className += "disabled";
			this.innerText = "Searching....";
			var that = this;

			$.getJSON('/search/' + user.val() + '/' + encodeURIComponent(text.val()),
				function(comments) {
					var template = Handlebars.compile(commentTemplate);
					$("#search_results").html(generateResultTemplate);
					that.innerText = "Search";
					that.className = that.className.replace(/\bdisabled\b/,'');
				}
			);
		}
	});

	$(".paginate_link").click(function() {
		var pageNum = this.dataset.pagenumber;

		switch (this.dataset.pageoperation) {
			case "prev":
				if (pageNum > 1) {
					// go to previous
				}
				break;
			case "mid":
				// go to middle page
				break;
			case "next":
				// go to next page
				break;
		}
	});
});

function generateResultTemplate(comments, currentPage, itemsPerPage) {
	if (typeof itemsPerPage === "undefined") {	itemsPerPage = 10 }
	return  template({
				comments: comments,
				pagination: {
					page: currentPage,
					pageCount: Math.ceil(comments.length/itemsPerPage)
				}
			});
}

// ===========================================
// ================ Templates ================
// ===========================================
var paginationTemplate = [
	'<div class="pagination pagination-centered">',
	'<ul>',
	'{{#paginate pagination type="previous"}}',
	'<li {{#if disabled}}class="disabled"{{/if}}><a href="#" data-pagenumber="{{n}}" data-pageoperation="prev" class="paginate_link" >Prev</a></li>',
	'{{/paginate}}',
	'{{#paginate pagination type="middle" limit="7"}}',
	'<li {{#if active}}class="active"{{/if}}><a href="#" data-pagenumber="{{n}}" data-pageoperation="mid" class="paginate_link">{{n}}</a></li>',
	'{{/paginate}}',
	'{{#paginate pagination type="next"}}',
	'<li {{#if disabled}}class="disabled"{{/if}}><a href="#" data-pagenumber="{{n}}" data-pageoperation="next" class="paginate_link">Next</a></li>',
	'{{/paginate}}',
	'</ul>',
	'</div>'
].join('\n');

var commentTemplate = [
	"{{#each comments}}",
	"<div class='row panel'>",
	"<div class='large-12 columns'>",
	"{{body}}<br>{{author}}",
	"</div>",
	"</div>",
	"{{/each}}"
].join('\n') + paginationTemplate;