from pymongo import MongoClient
from flask import Flask, jsonify, request, send_from_directory


app = Flask(__name__)

# Configura MongoDB
client = MongoClient("mongodb+srv://gblgn24:BTyc30LNIm3w77Yb@cluster0.lvi32.mongodb.net/wedding_gifts?retryWrites=true&w=majority")
db = client["wedding_gifts"]
gifts_collection = db["gifts"]

# Endpoint per ottenere tutti i regali
@app.route('/api/gifts', methods=['GET'])
def get_gifts():
    try:
        gifts = list(gifts_collection.find({}, {"_id": 0}))  # Rimuove `_id` dal risultato
        return jsonify(gifts), 200
    except Exception as e:
        return jsonify({"message": "Errore durante il recupero dei regali.", "error": str(e)}), 500

# Endpoint per selezionare un regalo
@app.route('/api/gifts/<int:gift_id>/select', methods=['POST'])
def select_gift(gift_id):
    try:
        data = request.json
        user_name = data.get("userName")
        user_email = data.get("userEmail")
        user_message = data.get("userMessage", "")

        if not user_name or not user_email:
            return jsonify({"message": "Nome ed email sono obbligatori."}), 400

        gift = gifts_collection.find_one({"id": gift_id})

        if not gift:
            return jsonify({"message": "Regalo non trovato."}), 404

        if not gift.get("available", True):
            return jsonify({"message": "Regalo già selezionato."}), 400

        gifts_collection.update_one(
            {"id": gift_id},
            {"$set": {
                "available": False,
                "reservedBy": {"name": user_name, "email": user_email, "message": user_message}
            }}
        )

        return jsonify({"message": "Regalo prenotato con successo!"}), 200
    except Exception as e:
        return jsonify({"message": "Errore durante la prenotazione del regalo.", "error": str(e)}), 500

# Servire il file index.html
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_file(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True, port=5500)