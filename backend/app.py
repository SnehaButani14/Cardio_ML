from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load trained pipeline (includes both StandardScaler and LogisticRegression)
# Point 1: Ensure backend loads the correct model.pkl file.
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(model_path, "rb") as f:
    model = pickle.load(f)

@app.route("/")
def home():
    return "Cardio Prediction API Running"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Frontend sends: { "data": [age, gender, height, weight, ap_hi, ap_lo, chol, gluc, smoke, alco, active] }
        incoming_data = request.json
        data_list = incoming_data.get("data", [])
        
        if len(data_list) != 11:
            return jsonify({"error": f"Expected 11 features, but got {len(data_list)}"}), 400

        # Point 4: Map values to match feature names exactly as defined in training/pipeline
        # Point 2: Feature order must match the training dataset
        features_dict = {
            "id": 0,  # 'id' was present during training but isn't relevant for prediction
            "gender": float(data_list[1]),
            "height": float(data_list[2]),
            "weight": float(data_list[3]),
            "ap_hi": float(data_list[4]),
            "ap_lo": float(data_list[5]),
            "cholesterol": float(data_list[6]),
            "gluc": float(data_list[7]),
            "smoke": float(data_list[8]),
            "alco": float(data_list[9]),
            "active": float(data_list[10]),
            "age_years": float(data_list[0])
        }

        # Point 5: Convert input to pandas DataFrame before prediction
        feature_order = ["id", "gender", "height", "weight", "ap_hi", "ap_lo", "cholesterol", "gluc", "smoke", "alco", "active", "age_years"]
        input_df = pd.DataFrame([features_dict], columns=feature_order)

        # Point 3: No manual scaling if Pipeline already contains StandardScaler
        # Point 6: No hardcoded or random values returned (calculated via model)
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])

        return jsonify({
            "prediction": prediction,
            "probability": probability
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run()