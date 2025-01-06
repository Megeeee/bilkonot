from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
load_dotenv()
print("MONGO_URI:", os.getenv("MONGO_URI"))
app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["grade_calculator"]

# GET all calculators
@app.route('/calculators', methods=['GET'])
def get_calculators():
    try:
        calculators = list(db.calculators.find())
        for calculator in calculators:
           calculator["_id"] = str(calculator["_id"])
        return jsonify(calculators)
    except Exception as e:
      return jsonify({"message":"Error fetching calculators"}), 500

# GET a calculator by ID
@app.route('/calculators/<calculator_id>', methods=['GET'])
def get_calculator(calculator_id):
    try:
        calculator = db.calculators.find_one({"_id": ObjectId(calculator_id)})
        if not calculator:
            return jsonify({"message": "Calculator not found"}), 404
        calculator["_id"] = str(calculator["_id"])
        return jsonify(calculator)
    except Exception as e:
        return jsonify({"message": "Error retrieving calculator"}), 500

# POST a new calculator
@app.route('/calculators', methods=['POST'])
def create_calculator():
  try:
        new_calculator = request.get_json()
        result = db.calculators.insert_one(new_calculator)
        new_calculator["_id"] = str(result.inserted_id)
        return jsonify(new_calculator), 201
  except Exception as e:
    return jsonify({"message": "Error creating calculator"}), 500

# PUT update a calculator
@app.route('/calculators/<calculator_id>', methods=['PUT'])
def update_calculator(calculator_id):
    try:
      updated_calculator = request.get_json()
      result = db.calculators.update_one(
        {"_id": ObjectId(calculator_id)},
        {"$set": updated_calculator}
      )
      if result.modified_count == 0:
          return jsonify({"message": "Calculator not found"}), 404
      updated_calculator["_id"] = calculator_id
      return jsonify(updated_calculator), 200
    except Exception as e:
       return jsonify({"message": "Error updating calculator"}), 500

# DELETE a calculator
@app.route('/calculators/<calculator_id>', methods=['DELETE'])
def delete_calculator(calculator_id):
     try:
       result = db.calculators.delete_one({"_id": ObjectId(calculator_id)})
       if result.deleted_count == 0:
            return jsonify({"message": "Calculator not found"}), 404
       return jsonify({}), 204
     except Exception as e:
        return jsonify({"message": "Error deleting calculator"}), 500

if __name__ == '__main__':
    app.run(debug=True)