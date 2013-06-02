$(document).ready(function() {

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
					$("#custom_search").after(template({ comments: comments }));
					that.innerText = "Search";
					that.className = that.className.replace(/\bdisabled\b/,'');
				}
			);
		}
	});
});

var commentTemplate =
	["{{#each comments}}",
	"<div class='row panel'>",
	"<div class='large-12 columns'>",
	"{{body}}<br>{{author}}",
	"</div>",
	"</div>",
	"{{/each}}"
	].join('\n');