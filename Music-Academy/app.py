import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

base_dir = os.path.dirname(os.path.abspath(__file__))
database_dir = os.path.join(base_dir, "database")
os.makedirs(database_dir, exist_ok=True)
database_path = os.path.join(database_dir, "instructors.db")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + database_path  #CONFIGURE setting of python file that add the link to the database in sqlite format
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False   

db = SQLAlchemy(app)

class Instructor(db.Model):  #a instruction class that controls the database
    id = db.Column(db.Integer, primary_key=True)   
    name =db.Column(db.String(100), nullable=False)   #name: Sarah Williams
    instrument = db.Column(db.String(100), nullable=False)  #instrument: Piano
    bio = db.Column(db.Text)  #bio: Piano instructor with 8 years of experience.
    photo = db.Column(db.String(250))   #photo: images/instructors/sarah.jpg

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    instructors = Instructor.query.all()  #a variable holds a packet of query that have all data of particular database
    return render_template('home.html', instructors=instructors) #render template sends the information to https 

def main():
    app.run(host = '0.0.0.0', port = 5000, debug = True)


if __name__ == '__main__':
    main()
    