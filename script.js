// --- Session Management ---
function isLoggedIn() {
    return localStorage.getItem("ehr_logged_in") === "true";
}
function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    if (username === "admin" && password === "password123") {
        localStorage.setItem("ehr_logged_in", "true");
        showSection("dashboard");
        document.getElementById("navigation").style.display = "block";
        document.getElementById("login-container").style.display = "none";
        renderCalendar();
    } else {
        alert("Invalid login. Try again.");
    }
}
function logout() {
    localStorage.removeItem("ehr_logged_in");
    document.getElementById("login-container").style.display = "block";
    document.getElementById("navigation").style.display = "none";
    hideAllSections();
}
function protect() {
    if (!isLoggedIn()) {
        document.getElementById("login-container").style.display = "block";
        document.getElementById("navigation").style.display = "none";
        hideAllSections();
    } else {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("navigation").style.display = "block";
    }
}
function hideAllSections() {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
}
function showSection(sectionId) {
    protect();
    if (!isLoggedIn()) return;
    hideAllSections();
    document.getElementById(sectionId).style.display = "block";
    if (sectionId === "dashboard") renderCalendar();
    if (sectionId === "records") viewPatients();
}

// --- Patient CRUD ---
function savePatient() {
    if (!isLoggedIn()) return protect();
    let name = document.getElementById("patientName").value.trim();
    let dateOfBirth = document.getElementById("dateOfBirth").value;
    let phoneNumber = document.getElementById("phoneNumber").value.trim();
    let diagnosis = document.getElementById("diagnosis").value.trim();
    let prescription = document.getElementById("prescription").value.trim();
    if (name && dateOfBirth && phoneNumber && diagnosis && prescription) {
        fetch("http://127.0.0.1:5000/add_patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, date_of_birth: dateOfBirth, phone_number: phoneNumber, diagnosis, prescription })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || "Patient added!");
            showSection("records");
        })
        .catch(error => alert("Error: " + error));
    } else {
        alert("Please fill in all fields.");
    }
}

function viewPatients() {
    fetch("http://127.0.0.1:5000/get_patients")
        .then(response => response.json())
        .then(records => {
            let recordsDiv = document.getElementById("records-list");
            recordsDiv.innerHTML = "";
            if (!records.length) {
                recordsDiv.innerHTML = "<p>No patient records found.</p>";
            } else {
                records.forEach(record => {
                    recordsDiv.innerHTML += `
                        <div class="patient-card" id="patient-${record.id}">
                            <strong>Name:</strong> ${record.name}<br>
                            <strong>Date of Birth:</strong> ${record.date_of_birth}<br>
                            <strong>Phone Number:</strong> ${record.phone_number}<br>
                            <strong>Diagnosis:</strong> ${record.diagnosis}<br>
                            <strong>Prescription:</strong> ${record.prescription}<br>
                            <button onclick="showEditForm(${record.id})">Edit</button>
                            <button onclick="deletePatient(${record.id})" style="background-color:#c00;">Delete</button>
                        </div>
                        <hr>
                    `;
                });
            }
        });
}

// Show Edit Form (as a prompt for simplicity)
function showEditForm(id) {
    fetch(`http://127.0.0.1:5000/get_patients`)
        .then(response => response.json())
        .then(records => {
            const patient = records.find(r => r.id === id);
            if (!patient) return alert("Patient not found!");

            // Use prompt for each field (for demo simplicity)
            const name = prompt("Edit Name:", patient.name);
            if (name === null) return;
            const dob = prompt("Edit Date of Birth (YYYY-MM-DD):", patient.date_of_birth);
            if (dob === null) return;
            const phone = prompt("Edit Phone Number:", patient.phone_number);
            if (phone === null) return;
            const diagnosis = prompt("Edit Diagnosis:", patient.diagnosis);
            if (diagnosis === null) return;
            const prescription = prompt("Edit Prescription:", patient.prescription);
            if (prescription === null) return;

            fetch(`http://127.0.0.1:5000/update_patient/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    date_of_birth: dob,
                    phone_number: phone,
                    diagnosis: diagnosis,
                    prescription: prescription
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                viewPatients();
            });
        });
}

function deletePatient(id) {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    fetch(`http://127.0.0.1:5000/delete_patient/${id}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        viewPatients();
    });
}

function searchPatient() {
    if (!isLoggedIn()) return protect();
    let query = document.getElementById("searchQuery").value.trim();
    fetch("http://127.0.0.1:5000/search_patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(records => {
        let recordsDiv = document.getElementById("records-list");
        recordsDiv.innerHTML = "";
        if (!records.length) {
            recordsDiv.innerHTML = "<p>No matching patients found.</p>";
        } else {
            records.forEach(record => {
                recordsDiv.innerHTML += `
                    <div class="patient-card">
                        <strong>Name:</strong> ${record.name}<br>
                        <strong>Date of Birth:</strong> ${record.date_of_birth}<br>
                        <strong>Phone Number:</strong> ${record.phone_number}<br>
                        <strong>Diagnosis:</strong> ${record.diagnosis}<br>
                        <strong>Prescription:</strong> ${record.prescription}<br>
                    </div>
                    <hr>
                `;
            });
        }
    });
}

// --- Calendar ---
let calendarRendered = false;
function renderCalendar() {
    if (calendarRendered) return;
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 400,
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch("http://127.0.0.1:5000/get_patients")
                .then(response => response.json())
                .then(data => {
                    // Show patient birthdays as events
                    let events = data.map(p => ({
                        title: p.name,
                        start: p.date_of_birth
                    }));
                    successCallback(events);
                })
                .catch(failureCallback);
        }
    });
    calendar.render();
    calendarRendered = true;
}

// --- On Load ---
window.onload = function() {
    if (isLoggedIn()) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("navigation").style.display = "block";
        showSection("dashboard");
    } else {
        document.getElementById("login-container").style.display = "block";
        document.getElementById("navigation").style.display = "none";
        hideAllSections();
    }
};
