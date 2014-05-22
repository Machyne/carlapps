# Insert a list of users into the carlapps.users Mongo collection
# from file 'users.txt'. All users are inserted with 'active' set to true.

from pymongo import MongoClient
import sys


def main(mongo_uri='mongodb://localhost:27017/carlapps'):
    client = MongoClient(mongo_uri)
    with open('lib/tasks/users.txt') as users_file:
        insert_users(client.get_default_database().users, users_file)


def insert_users(collection, users_file):
    for line in users_file:
        username = line.strip()
        if collection.find_one({'user': username}):
            print '%s already in database' % username
        else:
            collection.insert({
                'user': username,
                'active': True
            })


if __name__ == "__main__":
    args = {a.partition('=')[0].strip(): a.partition('=')[2].strip() for a in sys.argv[1:]}
    main(**args)
    print 'Success!'
