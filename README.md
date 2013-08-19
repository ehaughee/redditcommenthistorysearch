Reddit Comment History Search
=============================
A reddit comment history search built with Sinatra, Redis, and CoffeeScript.

### Requirements
- Redis
- Ruby 1.9.3 (although I think it should work with Ruby 2, but you'll have to change the Gemfile)
- Bundler

### Installation
1. `git clone git@github.com/ehaughee/redditcommenthistorysearch && cd redditcommenthistorysearch`
2. `bundle install`
3. `redis-server` (in another terminal window/tab)
4. `guard start`
5. Navigate to localhost:4567
