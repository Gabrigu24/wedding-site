from flask import Flask, jsonify, request, send_from_directory
from pymongo import MongoClient
import os

app = Flask(__name__, static_folder="static")

# Configura MongoDB
MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["wedding_gifts"]
gifts_collection = db["gifts"]

# API per ottenere i regali
@app.route('/api/gifts', methods=['GET'])
def get_gifts():
    try:
        gifts = list(gifts_collection.find({}, {'_id': 0}))
        return jsonify(gifts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API per selezionare un regalo
@app.route('/api/gifts/<int:gift_id>/select', methods=['POST'])
def select_gift(gift_id):
    try:
        data = request.json
        userName = data.get("userName")
        userEmail = data.get("userEmail")
        userMessage = data.get("userMessage", "")

        if not userName or not userEmail:
            return jsonify({"error": "Nome ed email sono obbligatori"}), 400

        gift = gifts_collection.find_one({"id": gift_id})
        if not gift:
            return jsonify({"error": "Regalo non trovato"}), 404
        if not gift["available"]:
            return jsonify({"error": "Regalo già selezionato"}), 400

        # Aggiorna il regalo
        gifts_collection.update_one(
            {"id": gift_id},
            {"$set": {"available": False, "reservedBy": {"name": userName, "email": userEmail, "message": userMessage}}}
        )
        return jsonify({"message": "Regalo prenotato con successo!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route per servire il frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static_file(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True)
