from flask import Flask, render_template, request, redirect, url_for, jsonify, send_from_directory
import os

app = Flask(__name__, 
            static_folder='../',  # Serve static files from parent directory
            template_folder='../')  # Templates are in parent directory

# ---------- ROUTES ----------

@app.route('/')
def home():
    return send_from_directory('../', 'index.html')

@app.route('/symptom-check')
def symptom_check():
    return send_from_directory('../', 'symptom-check.html')

@app.route('/medication-reminder')
def medication_reminder():
    return send_from_directory('../', 'medication-reminder.html')

@app.route('/login')
def login():
    return send_from_directory('../', 'login.html')

@app.route('/register')
def register():
    return send_from_directory('../', 'register.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('../', 'dashboard.html')

@app.route('/profile')
def profile():
    return send_from_directory('../', 'profile.html')

# Serve static files (CSS, JS, images)
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('../', filename)

# ---------- API ENDPOINT (DEMO) ----------

@app.route('/api/symptom-check', methods=['POST'])
def check_symptoms():
    data = request.json
    symptoms = data.get('symptoms', '')

    # Basic demo logic (replace with AI model in production)
    if "fever" in symptoms.lower():
        response = {
            "diagnosis": "Possible flu or infection.",
            "medication": "Paracetamol 500mg",
            "advice": "Stay hydrated and rest."
        }
    else:
        response = {
            "diagnosis": "Symptom not recognized.",
            "medication": "Consult a doctor.",
            "advice": "Try rephrasing your symptoms."
        }

    return jsonify(response)

# ---------- RUN APP ----------
if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run in production mode
    app.run(host='0.0.0.0', port=port, debug=False)
