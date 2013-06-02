require 'sinatra'
require 'sinatra/json'

require 'haml'
require 'json'
require 'redis'
require 'snooby'
require 'rack-flash'
require 'active_support'

if development?
  require 'sinatra/reloader'
  require 'better_errors'
  configure :development do
    use BetterErrors::Middleware
    BetterErrors.application_root = File.expand_path("..", __FILE__)
  end
end

# require './lib/database'
# require './lib/seed' if development?

enable :sessions
use Rack::Flash

def reddit
  reddit ||= Snooby::Client.new
end

def redis
  redis ||= Redis.new(host: "localhost", port: 6379)
end

seconds_to_cache = 1800

helpers do
  def partial(page, options={}, locals={})
    haml page.to_sym, options.merge!(:layout => false), locals
  end
end

get '/' do
  haml :index
end

# TODO: Should sanitize?
get '/check_user/:username' do |username|
  found = !reddit.user(username).about.nil?
  { found: found }.to_json
end

# TODO: Fix route
get '/search/filter/:username/:id' do |username, id|
  # filter = Filter.get(id)
  pass if filter.nil?
  # Search with filter stored in db
end

# TODO: Account for regex or normal for characters such as +
get '/search/:username/:query' do |username, query|
  if user_exists?(username)
    get_comments_by_user(username).keep_if { |c| c["body"].match(query) }.to_json
  end
end

def get_comments_by_user(username, limit = 1000000000)
  if cache_hit?(username)
    comments = JSON.parse(redis.get(username))
  else
    comments = reddit.user(username).comments(limit)
    Thread.new { redis.set(username, ActiveSupport::JSON.encode(comments)) }
    # TODO: Figure out setx
    # Thread.new { redis.setx(username, seconds_to_cache, comments.to_json) }
  end
  comments
end

def cache_hit?(key)
  !redis.get(key).nil?
end

def user_exists?(username)
  !reddit.user(username).about.nil?
end
