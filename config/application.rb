require File.expand_path('../boot', __FILE__)

require "rails"

%w(
  sprockets
  action_controller
  action_mailer
  active_resource
  rails/test_unit
).each do |framework|
  begin
    require "#{framework}/railtie"
  rescue LoadError
  end
end

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Carlapps
  class Application < Rails::Application
  end
end
