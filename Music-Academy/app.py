import os
from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

base_dir = os.path.dirname(os.path.abspath(__file__))
database_dir = os.path.join(base_dir, "database")
os.makedirs(database_dir, exist_ok=True)
database_path = os.path.join(database_dir, "instructors.db")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + database_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Instructor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    instrument = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    photo = db.Column(db.String(250))


with app.app_context():
    db.create_all()


@app.route('/')
def home():
    selected_instrument = request.args.get('instrument')

    if selected_instrument:
        instructors = Instructor.query.filter_by(instrument=selected_instrument).all()
    else:
        instructors = Instructor.query.all()

    preview_instructors = instructors[:3]

    return render_template(
        'home.html',
        instructors=instructors,
        preview_instructors=preview_instructors,
        selected_instrument=selected_instrument,
    )


@app.route('/instructors')
def all_instructors():
    instructors = Instructor.query.order_by(Instructor.name).all()
    return render_template('instructors.html', instructors=instructors)


def main():
    app.run(host='0.0.0.0', port=5000, debug=True)


if __name__ == '__main__':
    main()
