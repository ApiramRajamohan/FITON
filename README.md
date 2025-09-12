# Fiton – Virtual Wardrobe

## Project Overview
**Fiton** is a personalized virtual fitting room application that allows users to create avatars based on body measurements and virtually try on clothing from partner fashion brands. The system aims to reduce return rates, increase user confidence in online shopping, and provide brands with actionable insights into customer preferences.

---

## Table of Contents
- [Features](#features)  
- [Technologies](#technologies)  
- [Getting Started](#getting-started)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [Team & Roles](#team--roles)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

### User Features
- Create personalized avatars from body measurements.  
- Try clothes virtually on avatars with realistic fit and style simulation.  
- Save outfits and maintain a virtual wardrobe.  
- Mark clothes or outfits as favorites.  
- Receive size recommendations and personalized suggestions.

### Admin & Brand Features
- Upload and manage clothing catalogs with images, size charts, and 3D models.  
- Monitor system activity and manage partnerships.  
- Ensure compliance with privacy standards (GDPR/CCPA).  

### System Features
- Web and mobile optimized interface.  
- API integration with partner brands.  
- Real-time avatar rendering (<3s load time).  
- Scalable backend supporting 10,000+ concurrent users.  

---

## Technologies
- **Frontend:** React.js
- **Backend:** ASP.NET (MVC or Web API) + ADO.NET (direct SQL)
- **Database:** MySQL 
- **Authentication:** JWT  
- **Testing:** Selenium, JMeter, Unit Test
- **Deployment:** AWS 

---

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fiton.git
cd fiton
```

2. **Backend Setup**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
This will start the Spring Boot backend on the configured port (default: `http://localhost:8080`).

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
This will start the React/Next.js frontend on the configured port (default: `http://localhost:3000`).

4. **Database**
- Create a database named `fiton_db`.  
- Run SQL scripts in `/backend/src/main/resources/db/` to create tables.  

---

## Usage
1. Register a new account or login with existing credentials.  
2. Enter your body measurements in the avatar form.  
3. Generate your personalized avatar.  
4. Browse clothes from the wardrobe or shop section.  
5. Try clothes on your avatar and save favorites.  
6. Manage outfits in your wardrobe for future reference.  

---

## Project Structure
```
/fiton
├─ backend/            # Spring Boot backend
├─ frontend/           # React.js frontend
├─ docs/               # Documentation and diagrams
├─ tests/              # Unit & integration tests
├─ scripts/            # Setup / deployment scripts
└─ README.md
```

---

## Team & Roles

| Name          | Role (Sprint 1)       | Role (Sprint 2)       | Role (Sprint 3)       |
|---------------|---------------------|---------------------|---------------------|
| Dithara Avindi | BA + DevOps          | QA                  | Developer           |
| Dilahara       | QA                   | Developer           | QA                  |
| Yushri         | Developer            | BA + DevOps         | Developer           |
| Apiram         | Developer            | Developer           | BA + DevOps         |

---

## Contributing
We welcome contributions from team members and external developers.  

Steps to contribute:
1. Fork the repository.  
2. Create a new branch: `git checkout -b feature/your-feature`.  
3. Commit your changes: `git commit -m "Add new feature"`.  
4. Push to branch: `git push origin feature/your-feature`.  
5. Create a Pull Request (PR) for review.  

---

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contact
- **Project Manager / BA:** Dithara Avindi – dithara@example.com  
- **Frontend Lead:** Yushri – yushri@example.com  
- **Backend Lead:** Apiram – apiram@example.com  
- **QA Lead:** Dilahara – dilahara@example.com  

