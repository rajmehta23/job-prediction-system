# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import os
import pickle

app = Flask(__name__)
# Enable CORS for local development requests
CORS(app)

# Load data and fit the model exactly as in the original job_predict.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'job_prediction.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')

if not os.path.exists(CSV_PATH):
    raise FileNotFoundError(f"Dataset not found at: {CSV_PATH}")

data = pd.read_csv(CSV_PATH)

if os.path.exists(MODEL_PATH):
    print("Loading model from model.pkl...")
    with open(MODEL_PATH, 'rb') as f:
        multi_model = pickle.load(f)
else:
    print("Training Placement Prediction Model...")
    x = data[['CGPA', 'Internships', 'Projects', 'Certifications', 'Aptitude', 'Communication']]
    y = data['Placed']
    x_train_multi, x_test_multi, y_train_multi, y_test_multi = train_test_split(
        x, y, test_size=0.4, random_state=42
    )
    multi_model = LogisticRegression()
    multi_model.fit(x_train_multi, y_train_multi)
    # Save the trained model to model.pkl
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(multi_model, f)
    print("Model trained and saved to model.pkl successfully!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data_json = request.get_json()
        if not data_json:
            return jsonify({"error": "No JSON payload provided"}), 400

        # Extract parameters with defaults or checks
        required_fields = ['CGPA', 'Internships', 'Projects', 'Certifications', 'Aptitude', 'Communication']
        for field in required_fields:
            if field not in data_json:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Parse and validate values
        try:
            cgpa = float(data_json['CGPA'])
            internships = int(data_json['Internships'])
            projects = int(data_json['Projects'])
            certifications = int(data_json['Certifications'])
            aptitude = int(data_json['Aptitude'])
            communication = int(data_json['Communication'])
        except (ValueError, TypeError) as e:
            return jsonify({"error": f"Invalid data types in payload: {str(e)}"}), 400

        # Input constraints validation
        if not (0.0 <= cgpa <= 10.0):
            return jsonify({"error": "CGPA must be between 0.0 and 10.0"}), 400
        if internships < 0 or projects < 0 or certifications < 0:
            return jsonify({"error": "Internships, Projects, and Certifications must be non-negative"}), 400
        if not (0 <= aptitude <= 100):
            return jsonify({"error": "Aptitude must be between 0 and 100"}), 400
        if not (0 <= communication <= 100):
            return jsonify({"error": "Communication must be between 0 and 100"}), 400

        # Build feature vector
        student_data = [[cgpa, internships, projects, certifications, aptitude, communication]]
        
        # Calculate placing probability
        prob = multi_model.predict_proba(student_data)[0][1]
        
        # Determine status
        if prob >= 0.7:
            status = "High Chance"
        elif prob >= 0.4:
            status = "Moderate Chance"
        else:
            status = "Low Chance"

        # Construct response exactly as expected
        return jsonify({
            "probability": round(float(prob), 4),
            "status": status
        })

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# Pre-compute statistics for the frontend insights
placed_mask = data['Placed'] == 1
unplaced_mask = data['Placed'] == 0

stats_data = {
    "placed_averages": {
        "CGPA": round(float(data[placed_mask]['CGPA'].mean()), 2),
        "Internships": round(float(data[placed_mask]['Internships'].mean()), 2),
        "Projects": round(float(data[placed_mask]['Projects'].mean()), 2),
        "Certifications": round(float(data[placed_mask]['Certifications'].mean()), 2),
        "Aptitude": round(float(data[placed_mask]['Aptitude'].mean()), 2),
        "Communication": round(float(data[placed_mask]['Communication'].mean()), 2),
    },
    "unplaced_averages": {
        "CGPA": round(float(data[unplaced_mask]['CGPA'].mean()), 2),
        "Internships": round(float(data[unplaced_mask]['Internships'].mean()), 2),
        "Projects": round(float(data[unplaced_mask]['Projects'].mean()), 2),
        "Certifications": round(float(data[unplaced_mask]['Certifications'].mean()), 2),
        "Aptitude": round(float(data[unplaced_mask]['Aptitude'].mean()), 2),
        "Communication": round(float(data[unplaced_mask]['Communication'].mean()), 2),
    },
    "overall_averages": {
        "CGPA": round(float(data['CGPA'].mean()), 2),
        "Internships": round(float(data['Internships'].mean()), 2),
        "Projects": round(float(data['Projects'].mean()), 2),
        "Certifications": round(float(data['Certifications'].mean()), 2),
        "Aptitude": round(float(data['Aptitude'].mean()), 2),
        "Communication": round(float(data['Communication'].mean()), 2),
    }
}

@app.route('/stats', methods=['GET'])
def stats():
    return jsonify(stats_data), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200


if __name__ == '__main__':
    # Run the server on host 0.0.0.0 and port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
