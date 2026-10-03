import os
from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_assets import Environment, Bundle
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)

base_dir = os.path.dirname(os.path.abspath(__file__))
database_dir = os.path.join(base_dir, "database")
os.makedirs(database_dir, exist_ok=True)
database_path = os.path.join(database_dir, "instructors.db")
admissions_database_path = os.path.join(database_dir, "admissions.db")
contact_database_path = os.path.join(database_dir, "contacts.db")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + database_path
app.config["SQLALCHEMY_BINDS"] = {
    "admissions": "sqlite:///" + admissions_database_path,
    "contacts": "sqlite:///" + contact_database_path,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Instructor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    instrument = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    photo = db.Column(db.String(250))


class AdmissionApplication(db.Model):
    __bind_key__ = "admissions"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone = db.Column(db.String(32), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    main_subject = db.Column(db.String(50), nullable=False)
    secondary_subjects = db.Column(db.Text, nullable=False, default="")
    gender = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())


class ContactMessage(db.Model):
    __bind_key__ = "contacts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())


with app.app_context():
    db.create_all()


assets = Environment(app)

css_bundle = Bundle(
    'css/styles.css',
    'css/style2.css',
    'css/courses.css',
    filters = 'rcssmin',
    output = 'gen/packed.css'
)

js_bundle = Bundle(
    'js/scripts.js',
    filters = 'jsmin',
    output = 'gen/packed.js'
)

assets.register('main_css', css_bundle)
assets.register('main_js', js_bundle)

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


@app.route('/admission', methods=['GET', 'POST'])
def admission():
    if request.method == 'GET':
        return render_template(
            'admission.html',
            form_data={},
            selected_secondary_subjects=[],
            registration_success=request.args.get('submitted') == '1',
        )

    form_data = request.form
    first_name = form_data.get('first-name', '').strip()
    last_name = form_data.get('last-name', '').strip()
    email = form_data.get('email', '').strip().lower()
    phone = form_data.get('phone', '').strip()
    country = form_data.get('country', '').strip()
    main_subject = form_data.get('main-subject', '').strip()
    gender = form_data.get('gender', '').strip()
    selected_secondary_subjects = list(dict.fromkeys(
        value.strip() for value in form_data.getlist('secondary-subject') if value.strip()
    ))

    email_parts = email.split('@')
    valid_email = len(email_parts) == 2 and bool(email_parts[0]) and '.' in email_parts[1]
    valid_subject = main_subject in {'vocal', 'guitar', 'piano', 'violin', 'drums', 'production'}
    valid_gender = gender in {'male', 'female'}
    terms_accepted = form_data.get('terms-accepted') == 'on'

    if not all((first_name, last_name, phone, country)) or not valid_email or not valid_subject or not valid_gender or not terms_accepted:
        return render_template(
            'admission.html',
            form_data=form_data,
            selected_secondary_subjects=selected_secondary_subjects,
            registration_error='Some required details are missing or invalid. Check every required field and accept the consultation terms, then try again.',
        ), 400

    application = AdmissionApplication(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        country=country,
        main_subject=main_subject,
        secondary_subjects=', '.join(selected_secondary_subjects),
        gender=gender,
    )
    db.session.add(application)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return render_template(
            'admission.html',
            form_data=form_data,
            selected_secondary_subjects=selected_secondary_subjects,
            registration_error='This email already has an application. Each email can be used once. Contact the academy if you need help.',
        ), 409

    return redirect(url_for('admission', submitted='1'), code=303)


@app.route('/contact', methods=['POST'])
def contact():
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip().lower()
    subject = request.form.get('subject', '').strip()
    message = request.form.get('message', '').strip()

    if not all((name, email, subject, message)):
        return jsonify({
            'success': False,
            'message': 'Please complete all fields before sending your message.'
        }), 400

    email_parts = email.split('@')
    valid_email = len(email_parts) == 2 and bool(email_parts[0]) and '.' in email_parts[1]
    if not valid_email:
        return jsonify({
            'success': False,
            'message': 'Please enter a valid email address.'
        }), 400

    contact_message = ContactMessage(
        name=name,
        email=email,
        subject=subject,
        message=message,
    )
    db.session.add(contact_message)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Thank you! Your message has been sent successfully.'
    })


@app.route('/instructors')
def all_instructors():
    instructors = Instructor.query.order_by(Instructor.name).all()
    return render_template('instructors.html', instructors=instructors)


def main():
    app.run(host='0.0.0.0', port=5000, debug=True)


if __name__ == '__main__':
    main()
