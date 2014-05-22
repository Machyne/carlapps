namespace :dbinit do
  desc "Add all NNB's into the database"
  task all: :environment do
  end

  desc "Add today's NNB's into the database"
  task today: :environment do
    db_url = 'mongo_url=' + (ENV['MONGOHQ_URL']||'localhost')
    value = `python lib/tasks/nnb_fetch.py #{db_url}`
    p value
  end
end
