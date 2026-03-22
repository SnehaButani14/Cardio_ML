# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pickle
# import pandas as pd
# import numpy as np
# import os

# app = Flask(__name__)
# CORS(app)

# # Load trained pipeline (includes both StandardScaler and LogisticRegression)
# # Point 1: Ensure backend loads the correct model.pkl file.
# model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
# with open(model_path, "rb") as f:
#     model = pickle.load(f)

# @app.route("/")
# def home():
#     return "Cardio Prediction API Running"

# @app.route("/predict", methods=["POST"])
# def predict():
#     try:
#         # Frontend sends: { "data": [age, gender, height, weight, ap_hi, ap_lo, chol, gluc, smoke, alco, active] }
#         incoming_data = request.json
#         data_list = incoming_data.get("data", [])
        
#         if len(data_list) != 11:
#             return jsonify({"error": f"Expected 11 features, but got {len(data_list)}"}), 400

#         # Point 4: Map values to match feature names exactly as defined in training/pipeline
#         # Point 2: Feature order must match the training dataset
#         features_dict = {
#             "id": 0,  # 'id' was present during training but isn't relevant for prediction
#             "gender": float(data_list[1]),
#             "height": float(data_list[2]),
#             "weight": float(data_list[3]),
#             "ap_hi": float(data_list[4]),
#             "ap_lo": float(data_list[5]),
#             "cholesterol": float(data_list[6]),
#             "gluc": float(data_list[7]),
#             "smoke": float(data_list[8]),
#             "alco": float(data_list[9]),
#             "active": float(data_list[10]),
#             "age_years": float(data_list[0])
#         }

#         # Point 5: Convert input to pandas DataFrame before prediction
#         feature_order = ["id", "gender", "height", "weight", "ap_hi", "ap_lo", "cholesterol", "gluc", "smoke", "alco", "active", "age_years"]
#         input_df = pd.DataFrame([features_dict], columns=feature_order)

#         # Point 3: No manual scaling if Pipeline already contains StandardScaler
#         # Point 6: No hardcoded or random values returned (calculated via model)
#         prediction = int(model.predict(input_df)[0])
#         probability = float(model.predict_proba(input_df)[0][1])

#         return jsonify({
#             "prediction": prediction,
#             "probability": probability
#         })

#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({"error": str(e)}), 400

# if __name__ == "__main__":
#     app.run()




from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# -------------------------------
# LOAD MODEL
# -------------------------------
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")

try:
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully")
except Exception as e:
    print("❌ Error loading model:", e)
    model = None


# -------------------------------
# HOME ROUTE
# -------------------------------
@app.route("/")
def home():
    return "✅ Cardio Prediction API Running"


# -------------------------------
# MODEL INFO (GOOD FOR VIVA 🔥)
# -------------------------------
@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify({
        "model": "Logistic Regression (Pipeline with StandardScaler)",
        "features": 11,
        "inputs": [
            "age", "gender", "height", "weight",
            "ap_hi", "ap_lo", "cholesterol", "gluc",
            "smoke", "alco", "active"
        ],
        "output": ["prediction", "probability", "risk_level"]
    })


# -------------------------------
# VALIDATION FUNCTION
# -------------------------------
def validate_input(data):
    try:
        age = float(data[0])
        height = float(data[2])
        weight = float(data[3])
        ap_hi = float(data[4])
        ap_lo = float(data[5])

        if age <= 0 or age > 120:
            return "Invalid age value"
        if height <= 0 or weight <= 0:
            return "Height and Weight must be positive"
        if ap_hi <= 0 or ap_lo <= 0:
            return "Blood pressure must be positive"

        return None
    except:
        return "Invalid input format"


# -------------------------------
# PREDICTION ROUTE
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        incoming_data = request.json

        if not incoming_data or "data" not in incoming_data:
            return jsonify({"error": "Missing 'data' field"}), 400

        data_list = incoming_data["data"]

        if len(data_list) != 11:
            return jsonify({"error": f"Expected 11 features, got {len(data_list)}"}), 400

        # -------------------------------
        # VALIDATION
        # -------------------------------
        error_msg = validate_input(data_list)
        if error_msg:
            return jsonify({"error": error_msg}), 400

        # -------------------------------
        # FEATURE MAPPING
        # -------------------------------
        features_dict = {
            "id": 0,
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

        feature_order = [
            "id", "gender", "height", "weight",
            "ap_hi", "ap_lo", "cholesterol", "gluc",
            "smoke", "alco", "active", "age_years"
        ]

        input_df = pd.DataFrame([features_dict], columns=feature_order)

        # -------------------------------
        # PREDICTION
        # -------------------------------
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])

        # -------------------------------
        # RISK LEVEL (🔥 IMPORTANT)
        # -------------------------------
        if probability > 0.7:
            risk_level = "High"
        elif probability > 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        # -------------------------------
        # LOGGING (GOOD PRACTICE)
        # -------------------------------
        print("Input:", features_dict)
        print("Prediction:", prediction, "| Probability:", probability)

        return jsonify({
            "prediction": prediction,
            "probability": probability,
            "risk_level": risk_level
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 400


# -------------------------------
# RUN SERVER
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)