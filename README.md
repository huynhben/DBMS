# DBMS

Project Name:
    SchedU

Team Members:
    - Ben Huynh
    - Divyan Dhavale
    - Ethan Surber
    - Eunisela Wilson-Bahun

Description:
    This project is a cross-platform application designed to help college students manage their academic workload and personal commitments in one centralized system. The application connects with a learning management system (LMS), such as Canvas, to import assignments, due dates, and course information. Users can manually create tasks and events for things like extracurricular activities, work schedules, and personal plans. The system also provides estimated completion times based on assignment type and difficulty.

Features:


Set up Intructions:
    mysql -u root -p < schema.sql
    mysql -u root -p < seed.sql
    Make sure npm is installed, -npm install
    Make sure you have a .env.local filled out with your database password. There is a .env.example for refrence.
    Make sure DB is running before running the actual application.
    cd backend -> npm start
    cd frontend -> npm run dev
