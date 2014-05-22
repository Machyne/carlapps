namespace :dbinit do
  mongo_uri = 'mongo_uri=' + (ENV['MONGOHQ_URL'] ? 'mongodb://fetch:datfetch@oceanic.mongohq.com:10042/app17570829' : 'mongodb://localhost:27017/carlapps')

  desc "Add all users into the database"
  task users: :environment do
    value = `python lib/tasks/insert_users.py #{mongo_uri}`
    p value
  end

  desc "Add all NNB's into the database"
  task all: :environment do
    start_date = 'start_date=1/1/2014'
    value = `python lib/tasks/nnb_fetch.py #{mongo_uri} #{start_date}`
    p value
  end

  desc "Add today's NNB's into the database"
  task today: :environment do
    value = `python lib/tasks/nnb_fetch.py #{mongo_uri}`
    p value
  end
end
