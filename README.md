# TeleMediScribe 🩺✨

TeleMediScribe is a lightweight web application that helps users get instant symptom guidance and medication reminders through a simple, clean UI.

> Note: The current symptom-check logic is a demo endpoint. For real deployments, integrate an actual medical decision support/AI system with appropriate validation, safety checks, and compliance.

---

## ✨ Features

- **Symptom Check UI** (static front-end pages)
- **Medication Reminder** page
- **User Login / Register (demo back-end available)**
- **Dashboard & Profile pages**
- **Dockerized deployment** (compose + secure/prod variants)
- **Security documentation** included (`SECURITY.md`, `PRODUCTION-SECURITY.md`)

---

## 🏗️ Tech Stack

- **Frontend:** HTML/CSS/Vanilla JS
- **Backend:** Flask (Python)
- **Database:** SQLite (stored under `./instance/telemediscribe.db`)
- **Containerization:** Docker + Docker Compose

---

## 🚀 Quick Start (Local)

### Using Docker Compose (Recommended)

1. Build & run:

```bash
docker-compose up --build
```

2. Open the app:

- http://localhost:5000

3. Stop:

```bash
docker-compose down
```

---

## 🧰 Deployment (Production / Secure)

This repo includes multiple compose files for different scenarios.

### Secure Build

```bash
docker-compose -f docker-compose.secure.yml up --build
```

### Production

```bash
docker-compose -f docker-compose.production.yml up -d
```

Check status/logs:

```bash
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs -f
```

For full hardening steps, see:
- `SECURITY.md`
- `PRODUCTION-SECURITY.md`
- `README-Docker.md`

---

## 🗃️ Data Persistence

- The SQLite database lives in `./instance/telemediscribe.db`.
- Docker mounts `./instance` into the container so data persists across restarts.

---

## 🌐 API Endpoints

### Symptom Check (Demo)

- **POST** `/api/symptom-check`
- Body:

```json
{
  "symptoms": "string"
}
```

- Response (example):

```json
{
  "diagnosis": "Possible flu or infection.",
  "medication": "Paracetamol 500mg",
  "advice": "Stay hydrated and rest."
}
```

---

## 🔐 Security

Security related docs are included in this repository:

- `SECURITY.md` — vulnerability scan summary and improvements
- `PRODUCTION-SECURITY.md` — production security guide & operational checklist

---

## 📁 Project Structure (High-level)

- `backend/app.py` — Flask server + routes
- `instance/` — SQLite database storage
- `nginx/` — nginx configuration (for production reverse proxy)
- `js/`, `css/` — static assets
- `*.html` — front-end pages

---

## 🧪 Runbook / Troubleshooting

- If a port is already in use, change `5000` mapping in `docker-compose.yml` (and the corresponding `PORT` env).
- Ensure `instance/` is writable so SQLite can persist.

---

## 📝 Disclaimer

This application provides **general information** and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult a qualified healthcare professional for medical concerns.

---

## 🤝 Contributing

Contributions are welcome. If you add features (especially medical logic), please include:
- test cases
- clear safety/validation notes
- updated documentation

---

## 📄 License

Add your license here (e.g., MIT, Apache-2.0).
