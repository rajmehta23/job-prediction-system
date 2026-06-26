# AI-Powered Job Prediction System

[![Deploy Frontend to GitHub Pages](https://github.com/rajmehta23/job-prediction-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/rajmehta23/job-prediction-system/actions/workflows/deploy.yml)
[![Live Website](https://img.shields.io/badge/Live-Website-blueviolet)](https://rajmehta23.github.io/job-prediction-system/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, real-time job placement probability engine that predicts student placement likelihood using Machine Learning. Designed with a gorgeous Glassmorphism dark mode frontend and an optimized Flask/Python backend logic.

---

## 🔗 Project Links
* **GitHub Repository:** [https://github.com/rajmehta23/job-prediction-system](https://github.com/rajmehta23/job-prediction-system)
* **GitHub Pages Site (Live Frontend):** [https://rajmehta23.github.io/job-prediction-system/](https://rajmehta23.github.io/job-prediction-system/)

---

## 📱 Screenshots Section

### Live Dashboard
*Interactive Profile Builder with Live Placement Chance Gauge*
![Dashboard Screen](job_prediction_logo.png)

---

## ✨ Features

- **Live Prediction Engine:** Automatically computes student placement probability as inputs are tweaked.
- **Glassmorphism UI/UX:** Stunning, fluid dark mode dashboard designed with curated HSL color schemes.
- **Interactive Constellation Canvas:** Background particles follow cursor movements to form constellation lines.
- **Dynamic Profile Insights:** Automatically audits profile values against averages of historically placed students and provides actionable recommendation checklists.
- **Local Cache Log:** Stores historical prediction results locally to track changes side-by-side.
- **Auto CI/CD Deployment:** Fully automated GitHub Actions pipeline compiling typescript files and updating the static frontend automatically on every commit.

---

## 🛠️ Technologies Used

### Frontend
- **React 19 & TypeScript:** Scalable type-safe component logic.
- **Vite:** Blazing fast build tool and local development environment.
- **Tailwind CSS:** Harmonious styling and custom utility tokens.
- **Framer Motion & GSAP:** Dynamic layout animations and page entry sequences.
- **Lucide Icons:** Streamlined pixel-perfect iconography.

### Backend & Machine Learning
- **Python:** Language for training and predicting placement data.
- **Flask & Flask-CORS:** Lightweight API server handling predictive requests.
- **Scikit-Learn:** Machine learning library utilizing **Logistic Regression** for training placement probabilities.
- **Pandas & NumPy:** Scientific packages for dataset parsing and analytics.

---

## 📂 Folder Structure

```
job-prediction-system/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions automatic deployment workflow
├── .gitignore                # Global git ignore configuration
├── LICENSE                   # Project license file (MIT)
├── README.md                 # Project documentation
├── job_predict.py            # Local CLI training & interactive script
├── job_prediction.csv        # Student placement dataset
├── job_prediction_logo.png    # Dashboard preview assets
├── client/                   # Vite React + TypeScript Frontend
│   ├── public/               # Static public assets (Favicon, Logo)
│   ├── src/
│   │   ├── assets/           # Bundled assets (Hero images, logos)
│   │   ├── App.css           # Local custom UI rules
│   │   ├── App.tsx           # Primary application logic & interactive GUI
│   │   ├── index.css         # Tailwind directives & CSS config variables
│   │   └── main.tsx          # Client entrypoint
│   ├── package.json          # Frontend dependencies & run scripts
│   └── vite.config.ts        # Vite configuration (custom base path set)
└── server/                   # Flask Prediction API Backend
    ├── app.py                # Server app defining prediction APIs and stats
    ├── requirements.txt      # Python dependencies list
    └── model.pkl             # Trained Logistic Regression model serialization
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [Python](https://www.python.org/) (version 3.9+ recommended)

---

### Backend Setup (Flask Server)
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:** `venv\Scripts\activate`
   - **macOS/Linux:** `source venv/bin/activate`
4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the server:
   ```bash
   python app.py
   ```
   *The server starts on `http://localhost:5000`.*

---

### Frontend Setup (Vite React Client)
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 📡 API Documentation

The backend Flask application provides three endpoints:

### 1. Run Placement Prediction
* **Endpoint:** `POST /predict`
* **Content-Type:** `application/json`
* **Request Payload Example:**
  ```json
  {
    "CGPA": 8.5,
    "Internships": 2,
    "Projects": 3,
    "Certifications": 2,
    "Aptitude": 80,
    "Communication": 75
  }
  ```
* **Success Response Example:**
  ```json
  {
    "probability": 0.8142,
    "status": "High Chance"
  }
  ```

### 2. Retrieve Placement averages
* **Endpoint:** `GET /stats`
* **Success Response Example:**
  ```json
  {
    "overall_averages": {
      "CGPA": 7.15,
      "Internships": 1.63,
      "Projects": 3.51,
      "Certifications": 2.78,
      "Aptitude": 68.3,
      "Communication": 69.1
    },
    "placed_averages": {
      "CGPA": 8.21,
      "Internships": 2.34,
      "Projects": 4.86,
      "Certifications": 4.12,
      "Aptitude": 80.5,
      "Communication": 78.4
    },
    "unplaced_averages": { ... }
  }
  ```

### 3. Server Health check
* **Endpoint:** `GET /health`
* **Success Response Example:**
  ```json
  {
    "status": "healthy"
  }
  ```

---

## 🚀 Deployment

The frontend dashboard is configured to deploy automatically to GitHub Pages using **GitHub Actions**.

### How it Works:
- The configuration `base` path in `vite.config.ts` points to `/job-prediction-system/`.
- Every push to the `main` branch triggers `.github/workflows/deploy.yml`.
- The pipeline checks out code, builds static assets using Node.js, and deploys files inside `client/dist` directly onto the `gh-pages` branch.

---

## 🔮 Future Improvements

1. **Alternative ML Classifiers:** Integrate Random Forest and XGBoost classifiers for comparing predictive accuracy.
2. **User Authentication:** Allow students to create accounts, save profiles, and monitor progression charts over semesters.
3. **Mock Assessment Portal:** Embedded micro-quizzes to dynamically evaluate and refine the "Aptitude" score metric.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
