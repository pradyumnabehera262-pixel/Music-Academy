let mainSubject = document.getElementById("main-subject");

let secondarySubjects = document.getElementById("secondary-subjects");
let secondarySection = document.getElementById("secondary-section");

mainSubject.addEventListener("change", function () {

    // Remove previous secondary subjects
    secondarySubjects.innerHTML = "";
    secondarySection.hidden = true;
    secondarySection.classList.remove("secondary-section-visible");

    let subject = mainSubject.value;

    let courses = [];


    if (subject === "vocal") {

        courses = [
            "Indian Classical Vocal",
            "Western Vocal",
            "Bollywood Singing",
            "Vocal Technique"
        ];

    }

    else if (subject === "guitar") {

        courses = [
            "Music Theory",
            "Songwriting",
            "Acoustic Guitar",
            "Music Performance"
        ];

    }

    else if (subject === "piano") {

        courses = [
            "Music Theory",
            "Ear Training",
            "Composition",
            "Sight Reading"
        ];

    }

    else if (subject === "violin") {

        courses = [
            "Music Theory",
            "Ear Training",
            "Orchestra",
            "Music Performance"
        ];

    }

    else if (subject === "drums") {

        courses = [
            "Rhythm Training",
            "Percussion",
            "Band Performance",
            "Music Theory"
        ];

    }

    else if (subject === "production") {

        courses = [
            "Beat Making",
            "Recording",
            "Mixing",
            "Mastering",
            "Sound Design"
        ];

    }


    // Create checkboxes

    courses.forEach(function (course) {

        let label = document.createElement("label");

        let checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.name = "secondary-subject";

        checkbox.value = course;

        label.appendChild(checkbox);

        label.appendChild(
            document.createTextNode(" " + course)
        );

        secondarySubjects.appendChild(label);

    });

    if (courses.length > 0) {
        secondarySection.hidden = false;
        void secondarySection.offsetWidth;
        secondarySection.classList.add("secondary-section-visible");
    }

});

const registerButton = document.querySelector(".button");
const registerAction = registerButton?.closest(".register-action");

if (registerButton && registerAction) {
    const musicSymbols = ["♪", "♫", "♩", "♬", "♭", "♮"];
    const burstColors = ["#e75a08", "#c64f0d", "#e8ac14", "#7d3922", "#f2c18d"];

    registerButton.addEventListener("click", function () {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        for (let symbolIndex = 0; symbolIndex < 18; symbolIndex += 1) {
            const particle = document.createElement("span");
            const angle = (Math.PI * 2 * symbolIndex) / 18 - Math.PI / 2;
            const distance = 76 + Math.random() * 55;

            particle.className = "music-burst-symbol";
            particle.setAttribute("aria-hidden", "true");
            particle.textContent = musicSymbols[symbolIndex % musicSymbols.length];
            particle.style.color = burstColors[symbolIndex % burstColors.length];
            particle.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
            particle.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
            particle.style.setProperty("--burst-rotation", `${Math.round(Math.random() * 100 - 50)}deg`);
            particle.style.setProperty("--burst-delay", `${symbolIndex * 12}ms`);
            registerAction.appendChild(particle);
            const cleanupTimer = window.setTimeout(function () {
                particle.remove();
            }, 1500 + symbolIndex * 12);
            particle.addEventListener("animationend", function () {
                window.clearTimeout(cleanupTimer);
                particle.remove();
            }, { once: true });
        }
    });
}