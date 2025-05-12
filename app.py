from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

def connect_db():
    conn = sqlite3.connect("ehr_database.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            diagnosis TEXT NOT NULL,
            prescription TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn, cursor

@app.route("/add_patient", methods=["POST"])
def add_patient():
    data = request.get_json()
    required = ["name", "date_of_birth", "phone_number", "diagnosis", "prescription"]
    if not all(field in data and data[field] for field in required):
        return jsonify({"error": "All fields are required."}), 400
    conn, cursor = connect_db()
    cursor.execute(
        "INSERT INTO patients (name, date_of_birth, phone_number, diagnosis, prescription) VALUES (?, ?, ?, ?, ?)",
        (data["name"], data["date_of_birth"], data["phone_number"], data["diagnosis"], data["prescription"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Patient added successfully!"}), 201

@app.route("/get_patients", methods=["GET"])
def get_patients():
    conn, cursor = connect_db()
    cursor.execute("SELECT * FROM patients")
    records = cursor.fetchall()
    conn.close()
    patient_list = [
        {
            "id": r[0],
            "name": r[1],
            "date_of_birth": r[2],
            "phone_number": r[3],
            "diagnosis": r[4],
            "prescription": r[5]
        }
        for r in records
    ]
    return jsonify(patient_list)

@app.route("/search_patient", methods=["POST"])
def search_patient():
    data = request.get_json()
    query = data.get("query", "")
    conn, cursor = connect_db()
    cursor.execute(
        "SELECT * FROM patients WHERE name LIKE ? OR date_of_birth LIKE ? OR phone_number LIKE ?",
        (f"%{query}%", f"%{query}%", f"%{query}%")
    )
    records = cursor.fetchall()
    conn.close()
    patient_list = [
        {
            "id": r[0],
            "name": r[1],
            "date_of_birth": r[2],
            "phone_number": r[3],
            "diagnosis": r[4],
            "prescription": r[5]
        }
        for r in records
    ]
    return jsonify(patient_list)

# Route to Delete a Patient
@app.route("/delete_patient/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    conn, cursor = connect_db()
    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Patient deleted successfully!"})

# Route to Update a Patient
@app.route("/update_patient/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    data = request.json
    conn, cursor = connect_db()
    cursor.execute("""
        UPDATE patients SET name=?, date_of_birth=?, phone_number=?, diagnosis=?, prescription=?
        WHERE id=?
    """, (
        data["name"], data["date_of_birth"], data["phone_number"], data["diagnosis"], data["prescription"], patient_id
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "Patient updated successfully!"})

if __name__ == "__main__":
    app.run(debug=True)
