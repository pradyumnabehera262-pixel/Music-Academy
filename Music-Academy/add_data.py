from app import Instructor, app, db

with app.app_context():
    running = True

    while running:
        print("Please give required information to add the data safely.")

        valid_name = False
        while not valid_name:
            name = input("Please enter the instructor's name: ")
            if not name:
                valid_name = False
                print("Name cannot be empty.")
            else:
                valid_name = True

        valid_instrument = False
        while not valid_instrument:
            instrument = input("Please enter the instructor's Specialty instrument: ")
            if not instrument:
                valid_instrument = False
                print("Instrument cannot be empty.")
            else:
                valid_instrument = True

        valid_bio = False
        while not valid_bio:
            bio = input("Please enter the instructor's Bio (in a brief paragraph): ")
            if not bio:
                valid_bio = False
                print("Bio cannot be empty.")
            else:
                valid_bio = True


        valid_photo = False
        while not valid_photo:
            photo = input("Please enter the instructor's photo name: ")
            if not photo:
                valid_photo = False
                print("Photo cannot be empty.")
            elif not photo.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                valid_photo = False
                print("Photo does not have a valid extension.")
            else:
                valid_photo = True

        photo = "images/instructors/" + photo

        new_instructor = Instructor(name=name, instrument=instrument, bio=bio, photo=photo)

        db.session.add(new_instructor)
        db.session.commit()

        while True:
            ask = input("Enter only (y/n): ")
            if ask.lower() == "y":
                break
            elif ask.lower() == "n":
                running = False
                break
            else:
                print("please state your answer within y/n.")

