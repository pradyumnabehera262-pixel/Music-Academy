# Music Academy

A first-year college web project for a fictional music academy. It uses Flask for the backend, SQLite for local data storage, and HTML, CSS, and JavaScript for the pages and interactions.

## Features

- Music academy homepage with course, event, and instructor sections.
- Instructor directory backed by SQLite.
- Admission form with server-side validation and one application per email address.
- Contact form that validates and saves messages locally.
- Responsive layouts and interactive menus, dialogs, and animations.

## Requirements

- Python 3.9 or newer
- pip

The project does not currently include a `requirements.txt`, so install its Python packages manually:

```powershell
python -m pip install Flask Flask-Assets Flask-SQLAlchemy rcssmin jsmin
```

## Run locally

Open PowerShell in this project folder (the folder containing `app.py`) and run:

```powershell
python app.py
```

Then visit <http://127.0.0.1:5000>.

This uses Flask's development server with debug mode enabled. It is intended for local development and classroom demonstrations, not public production hosting.

## Pages and routes

| Route          | Method | Purpose                                                                         |
| -------------- | ------ | ------------------------------------------------------------------------------- |
| `/`            | GET    | Homepage; accepts an optional `?instrument=Piano` filter.                       |
| `/instructors` | GET    | Lists instructors alphabetically.                                               |
| `/admission`   | GET    | Displays the admission form.                                                    |
| `/admission`   | POST   | Validates and stores an admission application.                                  |
| `/contact`     | POST   | Validates and stores a contact message; returns JSON for the page's JavaScript. |

## Database files

The app creates the `database` folder and tables when it starts. The SQLite files are kept separate:

- `database/instructors.db` stores instructor records.
- `database/admissions.db` stores admission applications. Email addresses are trimmed and lowercased, and the database's unique constraint prevents a second application with the same email.
- `database/contacts.db` stores contact form messages.

Contact messages are saved locally; the app does not send email or provide an admin screen for reading them. Admission applications are also stored locally and are not shown in a management page.

## Add an instructor

Run the interactive data-entry script from the project folder:

```powershell
python add_data.py
```

When prompted, enter the instructor's name, instrument, bio, and photo filename. Put the photo in `static/images/instructors/` first, then enter its filename (for example, `piano-teacher.jpg`). The script checks the filename extension, but you should also make sure the image file exists in that folder.

## Project structure

```text
app.py                 Flask routes, SQLAlchemy models, and database setup
add_data.py            Interactive instructor data-entry script
database/              SQLite files created when the app runs
static/css/            Stylesheets
static/js/             Browser-side interactions
static/images/         Logos, backgrounds, and instructor photos
static/videos/         Homepage video
static/gen/            Bundled CSS and JavaScript output
templates/             Jinja HTML templates and shared partials
```

## Notes for the demo

- Use sample data unless you have permission to enter real people's personal information.
- The contact form reports success after the message is saved; it does not email the academy.
- Email validation is basic and does not verify ownership of an address.
- `db.create_all()` creates missing tables but does not migrate existing database schemas if model fields change.
