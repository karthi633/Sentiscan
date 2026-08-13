# SentiScan – Sensitive Data Masking and Security Validation

## Project Overview

SentiScan is a cybersecurity-focused web application designed to detect Personally Identifiable Information (PII) in uploaded images, identify sensitive regions, and mask the detected information before the image is shared with third-party platforms.

The system also provides functionality to restore protected images and maintain audit information related to file-processing activities.

## Objectives

* Detect sensitive/PII information in uploaded images.
* Identify the regions containing sensitive information.
* Mask sensitive regions to reduce the risk of data exposure.
* Allow restoration of masked images when required.
* Maintain audit records of relevant activities.
* Provide a simple web interface for secure file processing.

## Key Features

* PII Detection – Analyzes uploaded images to identify potentially sensitive information.
* Sensitive Data Masking – Masks detected sensitive regions in images.
* Image Restoration – Provides functionality to restore protected images.
* Audit Logs – Records relevant processing activities for security validation.
* Image Processing – Handles uploaded images through the backend processing system.
* Web Interface – Provides an interactive React-based interface for uploading and processing images.

## System Architecture

```text
                    User
                      |
                      v
              React.js Frontend
                      |
                      | HTTP API
                      v
               Python Backend
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      PII Detection  Masking   Restoration
          |           |           |
          +-----------+-----------+
                      |
                      v
                  SQLite DB
                      |
                      v
                  Audit Logs
```

## Application Workflow

1. The user uploads an image through the web interface.
2. The frontend sends the image to the Python backend.
3. The backend analyzes the image for potentially sensitive information.
4. Detected sensitive regions are returned to the frontend.
5. The user can process the identified regions for masking.
6. The backend generates the masked image.
7. The system stores the information required for restoration.
8. The protected image can be restored when required.
9. Relevant activities are recorded in the audit system.

## Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML
* CSS

### Backend

* Python
* REST API
* Image Processing

### Database

* SQLite

### Security and Privacy

* PII Detection
* Sensitive Region Identification
* Image Masking
* Image Restoration
* Audit Logging

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

## Project Structure

```text
SentiScan/
|
+-- backend/
|   +-- utils/
|   +-- app.py
|   +-- database.py
|   +-- main.py
|   +-- requirements.txt
|   +-- setup_pdf.py
|
+-- frontend/
|   +-- public/
|   +-- src/
|       +-- api/
|       +-- assets/
|       +-- components/
|       +-- App.jsx
|       +-- index.css
|       +-- main.jsx
|   +-- package.json
|   +-- vite.config.js
|
+-- .gitignore
+-- README.md
```

## API Operations

| Operation         | Endpoint    | Purpose                                        |
| ----------------- | ----------- | ---------------------------------------------- |
| PII Detection     | /detect-pii | Detects sensitive regions in an uploaded image |
| Image Masking     | /mask-image | Masks selected sensitive regions               |
| Image Restoration | /restore    | Restores a protected image                     |
| Audit Logs        | /logs       | Retrieves audit log information                |

## Role and Contributions

Role: Full-Stack Developer

My contributions included:

* Designed and developed the web application workflow.
* Developed the React.js frontend.
* Implemented frontend-to-backend API communication.
* Developed backend image-processing functionality using Python.
* Worked on PII detection and sensitive-region identification.
* Implemented image masking functionality.
* Implemented image restoration functionality.
* Integrated SQLite for audit and application data.
* Worked on audit logging and security validation.
* Tested the complete file-processing workflow.

## Project Information

Project Name: SentiScan
Project Type: Final Year Academic Project
Domain: Cybersecurity / Data Privacy
Role: Full-Stack Developer
Team Size: [Add your actual team size]
Complexity: High

## Privacy and Security

SentiScan is designed to reduce the risk of exposing sensitive information when processing or sharing images.

The application focuses on identifying sensitive regions and protecting them through masking before the protected image is shared externally.

Note: This project was developed for academic and educational purposes.

## Future Enhancements

* Improve PII detection accuracy using advanced AI/ML techniques.
* Support additional document and image formats.
* Improve automated sensitive-data classification.
* Add cloud deployment support.
* Enhance authentication and access control.
* Integrate additional security validation mechanisms.

## Screenshots

Screenshots of the application interface can be added here to demonstrate the PII detection, masking, and restoration workflow.

## License

This project is developed as an academic final-year project and is provided for educational and demonstration purposes.
