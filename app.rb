require 'sinatra'
require 'sinatra/json'

require 'newrelic_rpm'

require 'haml'
require 'json'
require 'redis'
require 'snooby'
require 'rack-flash'
require 'active_support'

if development?
  require 'better_errors'
  configure :development do
    use BetterErrors::Middleware
    BetterErrors.application_root = File.expand_path("..", __FILE__)
  end

  def redis
    redis ||= Redis.new(host: "localhost", port: 6379)
  end
end

if production?
    def redis
      uri = URI.parse(ENV["REDISCLOUD_URL"])
      redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
    end
end

# require './lib/database'
# require './lib/seed' if development?

enable :sessions
use Rack::Flash

def reddit
  reddit ||= Snooby::Client.new
end

CACHE_COMMENTS_SECONDS = 1800 # 30 minutes TODO: Move to config file
CACHE_UNAME_CHECK_SECONDS = 86400 # 1 day

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
  key = "unamecheck-" + username

  if (cache_hit?(key))
    logger.info "Cache hit on key: #{key}"
    found = redis.get(key) == "true";
  else
    logger.info "Cache miss on key: #{key}"
    found = !reddit.user(username).about.nil?
  end

  Thread.new {
    redis.set(key, found)
    if (!redis.expire(key, CACHE_UNAME_CHECK_SECONDS))
      logger.error "Failed to set expiration on #{key}" # TODO: this won't get hit
    end
  }

  { found: found }.to_json
end

# TODO: Fix route
get '/search/:username/filter/:id' do |username, id|
  # filter = Filter.get(id)
  pass if filter.nil?
  # Search with filter stored in db
end

# TODO: Account for regex or normal for characters such as +
get '/search/:username/:query' do |username, query|
  if query.length < 2
    { success: false, error: "Query too short.  Must be at least 3 characters." }.to_json
  elsif not user_exists?(username)
    { success: false, error: "User #{username} not found" }.to_json
  else
    # Validate Regex
    begin
      query = Regexp.new(query)
    rescue RegexpError => ex
      return { success: false, error: "#{ex.message}"}.to_json
    end

    { success: true, comments: get_comments_by_user(username).keep_if { |c| c["body"].match(query) }}.to_json
  end
end

def get_comments_by_user(username, limit = 1000000000)
  if cache_hit?(username)
    logger.info "Cache hit on key: #{username}"
    comments = JSON.parse(redis.get(username))
  else
    logger.info "Cache miss on key: #{username}"
    comments = reddit.user(username).comments(limit)
    if (comments.count > 0)
      comments_to_cache = comments.clone
      Thread.new {
        begin
          redis.set(username, ActiveSupport::JSON.encode(comments_to_cache))
          if (!redis.expire(username, CACHE_COMMENTS_SECONDS)) # TODO: Abstract this out
            logger.error "Failed to set expiration on #{username}" # TODO: this won't get hit
          end
        ensure  
          logger.info "Stored #{comments_to_cache.count} comment(s)"
        end
      }
    else
      logger.info "No comments found for user"
    end
  end
  comments
end

def cache_hit?(key)
  redis.exists(key)
end

def user_exists?(username)
  !reddit.user(username).about.nil?
end
