EHR Mock System  
A fully interactive Electronic Health Record (EHR) simulation designed with comprehensive CRUD functionality to manage patient records efficiently.  

Features 
- Patient Record Management – Add, view, and delete patient details.  
- Secure Login System – Restricted access with authentication.  
- Interactive Calendar View – Schedule and track appointments.  
- Advanced Search Functionality – Look up patients using Name, Date of Birth, or Phone Number.  
- Responsive UI – Optimized design for seamless accessibility across devices.  

Installation  
To get started, clone the repository and install dependencies:  

git clone https://github.com/YousefAlbawab/mock_ehr_system.git  
cd ehr-system  
pip install -r requirements.txt  
python app.py  

Make sure Flask and SQLite are properly installed before running the server! 

Usage Guide  
Login using:  
   - Username: `admin`  
   - Password: `password123`  

Manage Records:  
   - Navigate through the system to add, view, search, and remove patients.  

View Appointments:  
   - Use the calendar interface to schedule and track patient appointments.  

API Endpoints 
|   Endpoint              |   Method  |   Description                 |  
|-------------------------|-----------|-------------------------------|  
| `/add_patient`          | `POST`    | Add a new patient record.     |  
| `/get_patients`         | `GET`     | Retrieve all stored patients. |  
| `/delete_patient/{id}`  | `DELETE`  | Remove a patient by ID.       |  
| `/search_patient`       | `POST`    | Search for patients by Name, Date of Birth, or Phone Number. |  

Ensure API calls are made with proper request formatting for successful execution!  

Technologies Used  
- Flask – Backend framework for handling API requests.  
- SQLite – Lightweight database for storing patient records.  
- Vanilla JavaScript – Frontend logic for user interaction.  
- FullCalendar – Integrated scheduling and appointment tracking.  

License  
This project is licensed under the MIT License, allowing open-source contributions and modifications.  
