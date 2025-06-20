# Leave Management System

A comprehensive web-based Leave Management System developed as a major project for 4th semester. This system automates the workflow of leave applications and their approvals, reducing paperwork and maintaining records efficiently.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [System Architecture](#system-architecture)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🎯 About the Project

The Leave Management System (LMS) is an intranet-based application designed to streamline the leave application process within organizations. It provides a digital platform for employees to apply for leaves and for administrators to manage and approve leave requests efficiently.

### Key Objectives

- Automate the leave application and approval workflow
- Reduce paperwork and manual processes
- Maintain comprehensive leave records
- Provide real-time leave balance tracking
- Generate reports for administrative purposes

## ✨ Features

### Employee Features
- **User Registration & Authentication**: Secure login system for employees
- **Leave Application**: Apply for different types of leaves (Casual, Sick, Annual, etc.)
- **Leave History**: View past and current leave applications
- **Application Status**: Track the status of submitted applications (Pending, Approved, Rejected)
  
### Admin Features
- **Dashboard**: Overview of all leave applications and statistics
- **Leave Management**: Approve, reject, or modify leave application

## 🛠 Technology Stack

### Frontend
- **HTML5**: Structure and markup
- **CSS3**: Styling and responsive design
- **JavaScript**: Client-side interactivity

### Backend
- **Django**: Python web framework
- **Python**: Server-side programming language
- **SQL Database**: Database management system

### Additional Tools
- **pip**: Python package manager
- **Django Admin**: Built-in administration interface
- **Git**: Version control system

## 💻 System Requirements

### Minimum Requirements
- **Operating System**: Windows 7/8/10, macOS, or Linux
- **Python**: Version 3.8 or higher
- **Django**: Version 3.2 or higher
- **Database**: SQLite (default) or PostgreSQL/MySQL
- **Memory**: 4GB RAM
- **Storage**: 500MB free space
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## 🚀 Installation

### Prerequisites
1. Install Python 3.8+ from [python.org](https://www.python.org/downloads/)
2. Install pip (Python package manager)
3. Git for cloning the repository

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Bibekp025/Leave-Management-System.git
   cd Leave-Management-System
   ```

2. **Create Virtual Environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   # Install required packages
   pip install -r requirements.txt
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   python manage.py makemigrations
   python manage.py migrate
  ```
6. **Run Development Server**
   ```bash
   # Start the Django development server
   python manage.py runserver
   
   # Access the application at: http://127.0.0.1:8000/
   ```

## 📖 Usage

### For Students

1. **Registration**
   - Navigate to the registration page
   - Fill in personal details and create credentials
   - Wait for admin approval

2. **Applying for Leave**
   - Login to your account
   - Go to "Apply Leave" section
   - Select leave type, dates, and reason
   - Submit the application

3. **Tracking Applications**
   - Check "My Applications" to view status
   - Receive email notifications for updates

### For Teacher/Admin

1. **Login**
   - Use admin credentials to access admin panel
   - Dashboard shows overview of pending applications

2. **Managing Applications**
   - Review leave applications in the pending queue
   - Approve or reject with comments
   - View detailed employee leave history

## 🏗 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Application   │    │      Data       │
│      Layer      │    │      Layer      │    │      Layer      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│   HTML/CSS/JS   │◄──►│ Django Framework│◄──►│  SQL Database   │
│   Bootstrap     │    │ Python Views    │    │ Django Models   │
│ Django Templates│    │ Business Logic  │    │ ORM Mapping     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```


## 🤝 Contributing

We welcome contributions to improve the Leave Management System! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git fork https://github.com/Bibekp025/Leave-Management-System.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make Changes**
   - Write clean, commented code
   - Follow existing code style
   - Test your changes thoroughly

4. **Commit Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Include screenshots if UI changes are made

### Development Guidelines

- Follow PEP 8 coding standards for Python
- Use Django's built-in features and conventions
- Write meaningful variable and function names
- Add docstrings for functions and classes
- Use Django's ORM instead of raw SQL queries
- Test all functionality before submitting
- Update documentation for new features

### Common Django Commands

```bash
# Create new Django app
python manage.py startapp app_name

# Make migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Open Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Project Maintainer**: Bibek  
**GitHub**: [@Bibekp025](https://github.com/Bibekp025)  
**Project Link**: [https://github.com/Bibekp025/Leave-Management-System](https://github.com/Bibekp025/Leave-Management-System)

---

### 🙏 Acknowledgments

- Thanks to all contributors who helped in developing this system
- Special appreciation to the academic supervisors for guidance
- Inspiration from various open-source leave management systems

### 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Python Documentation](https://docs.python.org/)
- [Django REST Framework](https://www.django-rest-framework.org/) (if using API)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)

---

*This project was developed as part of the 4th semester academic curriculum. It demonstrates practical application of web development concepts including database design, server-side programming, and user interface development.*
