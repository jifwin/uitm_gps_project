import sqlite3
import os

from flask import jsonify
from flask import request
from flask import render_template
from flask import send_from_directory
from flask.ext.httpauth import HTTPBasicAuth

from app import app


auth = HTTPBasicAuth()


def interprete_data(cursor):
    names = list(map(lambda x: x[0], cursor.description))
    return [dict(zip(names, row)) for row in cursor.fetchall()]


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/x-icon')


def get_id_by_username(username):
    conn = sqlite3.connect('data.db').cursor()
    x = conn.execute("select id from users where username='%s'" % username)
    user_id = x.fetchone()
    if user_id is None:
        user_id = None
    else:
        user_id = user_id[0]
    conn.close()
    return user_id


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/last', methods=['GET'])
@auth.login_required
def last():
    conn = sqlite3.connect('data.db')
    user_id = get_id_by_username(auth.username())
    query = conn.execute(
        "select lat,long,precision,max(time) as time,strftime('%%s','now','localtime')-strftime('%%s',time) as active ,username, user_id from locations, users where locations.user_id = users.id and locations.user_id in (select f1.user2_id from friends f1, friends f2 where f1.user1_id = f2.user2_id and f1.user2_id = f2.user1_id and f1.user1_id = %i) group by user_id order by time desc;" % user_id)
    return jsonify({"locations": interprete_data(query)})

@app.route('/user/<int:user_id>', methods=['GET'])
def last_user(user_id):
    conn = sqlite3.connect('data.db')
    query = conn.execute("select * from locations where user_id = %s order by time desc limit 1" % user_id)
    return jsonify({"locations": interprete_data(query)})

@app.route('/add/location', methods=['GET', 'POST'])  #todo:remove get #wazne
@auth.login_required
def add_location():
    if not request.json:
        return 'nie json'

    input_json = request.json["location"][0]
    lat = input_json['lat']
    longi = input_json['longi']
    precision = input_json['precision']

    conn = sqlite3.connect('data.db')
    user_id = get_id_by_username(auth.username())
    conn.execute(
        "insert into locations (user_id,lat,long,time,precision) values(%i,%f,%f,datetime('now','localtime'),%f)" % (
        user_id, lat, longi, precision))
    conn.commit()
    conn.close()

    return jsonify({"status": "OK, ziomek!"})


@app.route('/debug/users/', methods=['GET'])
def users():
    conn = sqlite3.connect('data.db')
    query = conn.execute('select * from users')
    return jsonify({"users": interprete_data(query)})


@auth.get_password
def get_password(username):
    try:
        conn = sqlite3.connect('data.db')
        query = conn.execute('select password from users where username = "%s"' % username)
        auth_data = interprete_data(query)

        if "password" in auth_data[0]:
            return auth_data[0]['password']
    except:
        pass
    return None


@app.route('/add/friend/<string:username>', methods=['GET', 'POST'])  #todo: methody?
@auth.login_required
def add_friend(username):
    user1_id = get_id_by_username(str(auth.username()))
    user2_id = get_id_by_username(str(username))

    if user1_id is None or user2_id is None:
        return jsonify({"status": "nie"})
    #if exist
    conn = sqlite3.connect('data.db').cursor()
    query1 = conn.execute("select count(*) from friends where user1_id = %s AND user2_id=%s" % (user1_id, user2_id))
    count1 = query1.fetchone()
    query2 = conn.execute("select count(*) from friends where user1_id = %s AND user2_id=%s" % (user2_id, user1_id))
    count2 = query2.fetchone()

    if count1[0] != 0 and count2[0] != 0:
        return jsonify({"status": "juz sa"})
    conn.close()

    if user1_id != user2_id:
        conn = sqlite3.connect('data.db')
        conn.execute("insert into friends (user1_id, user2_id) values (%i,%i)" % (user1_id, user2_id))
        conn.commit()
        conn.close()

        return jsonify({"raport": "spoko ziomek" + str(user1_id) + str(user2_id)})
    else:
        return jsonify({"status": "nie"})

@app.route('/get/id/<string:username>')
@auth.login_required
def get_id(username):
    return jsonify({"id": get_id_by_username(str(username))})

@app.route('/register/user', methods=['POST'])
def register_user():
    if not request.json:
        return 'not json'
    input_json = request.json["user_data"][0]

    username = input_json["username"]
    password = input_json["password"]

    conn = sqlite3.connect('data.db')
    query = conn.execute("select count(*) as count from users where username = '%s'" % username)
    response = query.fetchone()[0]

    if response == 0:
        conn.execute("insert into users (username, password, active) values ('%s','%s',0)" % (username, password))
        conn.commit()
        conn.close()
        return jsonify({"status": "registered"})

    conn.close()
    return jsonify({"status": "failed"})


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/register')
def register():
    return render_template('register.html')
