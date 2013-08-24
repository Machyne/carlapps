# magic comment (DNE) use encoding: utf-8 because we have to translate the symbol of death a.k.a â��
#
# MongoDB documents:
#
# NNB Post:
#
#					BSON				Python
#	type			String
#	content			String
#	contact			String
#	appeared		(Date) Array		[datetime.datetime]
#	appearedIndex	(Integer) Array		[int]
#	date			Date				datetime.datetime
#
# User:
#
#					BSON
#	active			Boolean
#	user			String

from pymongo import MongoClient
from datetime import datetime
from urllib import urlencode, urlopen
import re

users = set()

# Gets an array of posts (as dicts) from get_todays_posts
# then processes and adds each one to carlapps.nnb
#
# First generates a dictionary of users from carlapps.users which is
# used to put anchors on the names of users in posts
def put_todays_nnb_in_mongo(client):
	db = client.carlapps
	load_global_users_set_from_collection(db.users)
	nnb_collection = db.nnbs
	todays_posts = get_todays_posts()
	for post in todays_posts:
		# Note that a duplicate can occur on the same day
		duplicate = nnb_collection.find_one({"type":post["type"], "date":post["date"], "content":post["content"]})
		if duplicate:
			if post["appeared"] not in duplicate["appeared"]:
				duplicate["appeared"] += post["appeared"]
				duplicate["appearedIndex"] += post["appearedIndex"]
				nnb_collection.save(duplicate)
		else:
			nnb_collection.insert(post)

def load_global_users_set_from_collection(users_collection):
	global users
	for user_doc in users_collection.find({"active":True}):
		users.add(user_doc["user"])
	return None

# Return an array of python dicts each representing a post in today's nnb
def get_todays_posts():
	# Get an array of sections for today's nnb, where each section is (title, content)
	today = datetime.today()
	today_html = get_html_for_date(today)
	sections = find_sections_in_html(today_html)
	# Process each section's content into an array of posts as text
	# (Parse html to text, split into array of posts, remove surrounding whitespace, leave out empty strings)
	sections = [( title, filter(bool, [post.strip() for post in posts_from_content(content)])) \
		for (title, content) in sections]
	# Create a dict for each post
	# Add anchors for users, email addresses, and web addresses
	publish_date = get_publish_date_from_html(today_html)
	todays_posts = []
	post_index = 0
	for section in sections:
		type, date = type_and_date_from_title_and_publish_date(section[0], publish_date)
		for post in section[1]:
			post_with_anchors, contact = add_anchors_and_get_contact(post)
			new_post = {"type":type, "content":post_with_anchors,
					"appeared":[publish_date], "appearedIndex":[post_index]}
			new_post["contact"] = contact if contact
			new_post["date"] = date if date
			todays_posts.append(new_post)
			post_index += 1
	return todays_posts

# Gets the HTML from apps.carleton.edu for the NNB for a specified date
# TODO: For now, this function gets HTML from a test file
def get_html_for_date(date):
	# Get HTML from nnb_test_html.html
	test_file = open('nnb_test_html.html', 'r')
	s = test_file.read()
	test_file.close()
	return s
	#
	if False:
		request = urlencode({'year' : date.year, 'month' : date.month, 'day' : date.day})
		f = urllib.urlopen("https://apps.carleton.edu/campact/nnb/local/show.php3", request)
		s = f.read()
		f.close()
		return s

# Returns an array of (title, content)
# Title and content should be parsed to remove HTML tags and entities
def find_sections_in_html(nnb_html):
	flags = re.DOTALL | re.IGNORECASE
	pattern = re.compile(r'<p><br><b><u>(.*?)</u></b><br>(.*?)</p></td></tr>(?:</tbody>)?</table>', flags)
	return re.findall(pattern, nnb_html)

# Split posts, remove nbsp, translate â��, remove extra newlines
def posts_from_content(content):
	parsed = re.sub("&nbsp;", lambda _: "", content)
	parsed = re.sub(r"\xc3\xa2\xef\xbf\xbd\xef\xbf\xbd", lambda _: "'", parsed)
	return parsed.split('<br class="ad">')

def get_publish_date_from_html(nnb_html):
	flags = re.IGNORECASE
	match_date_in_title_tag = re.compile('<title>.*?day, ([A-Z][a-z]+) ([0-9]+?), ([0-9]+?)</title>', flags)
	month_string, day, year = re.search(match_date_in_title_tag, nnb_html).groups()
	return datetime(int(year), month_from_string(month_string), int(day))

# Return the appropriate type, and, if the section is an events section, the date
# Assumes that all events listings in an issue of the NNB are for the same year in which the issue was published
# Date titles must be of the format "Monday, September 5"
# Types are lowercase strings with "and" in place of any ampersands
def type_and_date_from_title_and_publish_date(title, publish_date):
	match_date_titles = re.compile('(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day, ([A-Z][a-z]+) ([0-9]+)')
	date_in_title = match_date_titles.match(title)
	if title == "Today":
		return ("events", publish_date)
	elif date_in_title:
		year = publish_date.year
		month_string, day = date_in_title.groups()
		return ("events", datetime(int(year), month_from_string(month_string), int(day)))
	else:
		processed_title = re.sub("&amp;", lambda _: 'and', title.strip().lower())
		return (processed_title, None)

def month_from_string(month_string):
	return ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"].index(month_string) + 1

# Returns a new string in which anchor tags have been added around all users, email addresses, and web addresses
def add_anchors_and_get_contact(post):
	new_post = ""
	contact = None
	# Even-sized list where even indexes are words and odd indexes are separators
	word_split = re.split('(\W+)', post) + ['']
	skip = 0
	for i in xrange(len(word_split) / 2):
		if skip:
			skip -= 1
			continue
		word = word_split[i * 2]
		separator = word_split[i * 2 + 1]
		# schillek	@		gmail	.		com
		# i * 2		+1		+1		+1		+1
		is_email = separator == "@" and len(word_split) - i * 2 > 5 and word_split[i * 2 + 3] == "."
		if is_email:
			domain = word_split[i * 2 + 2]
			tld = word_split[i * 2 + 4]
			separator_2 = word_split[i * 2 + 5]
			email = word + "@" + domain + "." + tld
			skip = 2
		if word in users:
			contact = word
			if is_email:
				# e.g. "schillek@carleton.edu"
				open_tag = '<a user="' + word + '"href="mailto:' + email + '"class="user email">'
				close_tag = '</a>'
				new_post += open_tag + email + close_tag + separator_2
			else:
				open_tag = '<a user="' + word + '"class="user">'
				close_tag = '</a>'
				if separator and separator[0] == "@":
					# e.g. "schillek@"
					new_post += open_tag + word + "@" + close_tag + separator[1:]
				else:
					# e.g. "schillek"
					new_post += open_tag + word + close_tag + separator
		else:
			# not a user
			if is_email:
				# email
				open_tag = '<a href="mailto:' + email + '"class="email">'
				close_tag = '</a>'
				new_post += open_tag + email + close_tag + separator_2
			else:
				# nothing special
				new_post += word + separator
	# Wrap an anchor around all web addresses
	web_address_match = re.compile(r'(^|\s)((?:[\w\-/:]+?\.)?[\w\-]+\.\w{2,3}(?:[\./][\w\-\./#\?]*?)??)([^\w/]?(?:$|[^\w\-\./#\?]))')
	new_post = re.sub(web_address_match, wrap_web_address_match, new_post)
	return new_post, contact

def wrap_web_address_match(match):
	pre = match.group(1)
	link = match.group(2)
	post = match.group(3)
	href = "http://" + link.split("://")[-1]
	return pre + '<a href="' + href + '"class="web"target="_blank">' + link + '</a>' + post

if __name__=="__main__":
	# TODO: Give the correct address and port for the database
	# TODO: Make sure user docs can be found in the collection carlapps.users
	client = MongoClient("localhost", 27017)
	put_todays_nnb_in_mongo(client)

	# Testing
	# load_global_users_set_from_collection(MongoClient('localhost', 27017).pydb.users)
	# for a in get_todays_posts():
	# 	print a, '\n'