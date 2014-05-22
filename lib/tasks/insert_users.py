# Insert a list of users into the carlapps.users Mongo collection
# from file 'users.txt'. All users are inserted with 'active' set to true.

from pymongo import MongoClient


def main():
    client = MongoClient('localhost', 27017)
    with open('users.txt') as users_file:
        insert_users(client.carlapps.users, users_file)


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
    main()
