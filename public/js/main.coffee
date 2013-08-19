_comments = undefined

# Cached selector storage
query = undefined
username = undefined
search_results = undefined
search_results_alert = undefined
search_user_check_display = undefined
search_custom_button = undefined

$(document).ready ->
  Handlebars.registerHelper 'paginate', paginate

  # Cache selectors
  query = $("#search_custom_text")
  username = $("#search_username")
  search_results = $("#search_results")
  search_results_alert = $("#search_results_alert")
  search_user_check_display = $("#search_user_check_display > span")
  search_custom_button = $("#search_custom_button")

  $("#search_username").keyup ->
    html = ""
    classes = ""
    if @value.length > 2
      html = "<img src=\"/img/ajax-spinner.gif\" />"
      classes = "label round secondary"

      $.getJSON "/check_user/#{encodeURIComponent(@value)}", (data) ->
        if data.found is true
          html = "<b>&#x2714;</b>"
          classes = "label round success"
        else if data.found is false
          html = "<b>&#x2714;</b>"
          classes = "label round success"
        else
          html = "<b>Err</b>"
          classes = "label round secondary"

        search_user_check_display.html html
        search_user_check_display.attr "class", classes
    else
      html = "<b>?</b>"
      classes = "lable round secondary"

    search_user_check_display.html html
    search_user_check_display.attr "class", classes

  query.keyup (e) ->
    if e.keyCode is 13 # Enter is pressed
      search_custom_button.click.apply(search_custom_button)

  search_custom_button.click ->

    if search_results_alert.is(":visible")
      search_results_alert.hide()

    if query.val().length > 0 and username.val().length > 2
      search_custom_button.addClass "disabled"
      search_custom_button.text "Searching..."
      search_results.html "<img class=\"loading_bar\" src=\"img/loading-bar.gif\" />"

      $.getJSON "/search/#{encodeURIComponent(username.val())}/#{encodeURIComponent(query.val())}",
        (data) ->
          if data.success
            if data.comments.length > 0
              _comments = data.comments
              search_results.html generateResultTemplate(data.comments)
              registerPaginationClickEvent()
            else
              search_results.html ""
              displayAlert "No results found"
          else
            search_results.html ""
            displayAlert "<b>Error:</b> #{data.error}", "alert"

          search_custom_button.text "Search"
          search_custom_button.removeClass "disabled"
  username.focus()

  $("#search_custom_clear_button").click ->
    search_results.empty() if search_results.children().length > 0
    query.focus()
    query.select()

displayAlert = (msg, type) ->
  if msg?
    message = search_results_alert.children("span.message")
    message.html(msg)

    if type?
      search_results_alert.addClass(type)

    search_results_alert.show()

registerPaginationClickEvent = ->
  $(".paginate_link").click ->
    if _comments?
      pageNum = @dataset.pagenumber
      search_results.html generateResultTemplate(_comments, pageNum)
      registerPaginationClickEvent()
    else
      console.log "No comments to paginate!"

generateResultTemplate = (comments, currentPage, itemsPerPage) ->
  template = Handlebars.compile(commentTemplate)
  itemsPerPage = 3 if not itemsPerPage? || itemsPerPage < 1
  currentPage = 1 if not currentPage? || currentPage < 1

  pageCount = Math.ceil(comments.length/itemsPerPage)
  currentItem =
    if (currentPage * itemsPerPage) < comments.length
    then (currentPage * itemsPerPage)
    else comments.length

  begin =
    if currentItem - itemsPerPage >= 0
    then currentItem - itemsPerPage
    else 0

  end = currentItem

  comments = comments.slice(begin, end)

  template
    comments: comments
    pagination:
      page: currentPage
      pageCount: pageCount

Handlebars.registerHelper 'split', (text, splitter, which) ->
  if not text?
    return ""

  pieces = text.split(splitter)
  which = parseInt(which)

  if which? && (-1 < which < pieces.length)
    return pieces[which]
  
  pieces


# ===========================================
# ================ Templates ================
# ===========================================
paginationTemplate = """
  <div class="pagination pagination-centered">
    <ul>
      {{#paginate pagination type="previous"}}
        <li class="arrow{{#if disabled}} unavailable{{/if}}">
          <a href="#" data-pagenumber="{{n}}" data-pageoperation="prev" class="paginate_link" >Prev</a>
        </li>
      {{/paginate}}
      {{#paginate pagination type="middle" limit="7"}}
        <li {{#if active}}class="current"{{/if}}>
          <a href="#" data-pagenumber="{{n}}" data-pageoperation="mid" class="paginate_link">{{n}}</a>
        </li>
      {{/paginate}}
      {{#paginate pagination type="next"}}
        <li class="arrow{{#if disabled}} unavailable{{/if}}">
          <a href="#" data-pagenumber="{{n}}" data-pageoperation="next" class="paginate_link">Next</a>
        </li>
      {{/paginate}} 
    </ul>
  </div>
"""

commentTemplate = paginationTemplate +
"""
  {{#each comments}}
    <div class='row panel comment_well'>
      <div class='row'>
        <div class='large-12 columns comment_body'>
          {{body}}
        </div>
      </div>
      <hr />
      <div class='row comment_footer'>
          <div class='large-8 columns comment_author'>
            - {{author}}
          </div>
          <div class='large-4 columns comment_links'>
            <a href='http://reddit.com/comments/{{split link_id \"_\" 1}}/_/{{id}}' target='_blank'>View on Reddit</a>
          </div>
      </div>
    </div>
  {{/each}}
""" + paginationTemplate
