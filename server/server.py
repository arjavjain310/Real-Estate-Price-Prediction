from flask import Flask, request, jsonify
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)  # allow requests from client folder


@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    try:
        locations = util.get_location_names()
        return jsonify({'locations': locations, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'})


@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    try:
        data = request.get_json(force=True)

        # Validate required fields
        required_fields = ['total_sqft', 'location', 'bhk', 'bath']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}', 'status': 'error'})

        total_sqft = float(data['total_sqft'])
        location = data['location']
        bhk = int(data['bhk'])
        bath = int(data['bath'])

        # Validate input values
        if total_sqft <= 0 or bhk <= 0 or bath <= 0:
            return jsonify({'error': 'All values must be positive', 'status': 'error'})

        estimated_price = util.get_estimated_price(location, total_sqft, bhk, bath)
        return jsonify({
            'estimated_price': estimated_price,
            'status': 'success',
            'input': {
                'location': location,
                'total_sqft': total_sqft,
                'bhk': bhk,
                'bath': bath
            }
        })

    except ValueError as e:
        return jsonify({'error': 'Invalid input values', 'details': str(e), 'status': 'error'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'})


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': util.get_location_names() is not None})


if __name__ == '__main__':
    print("Starting Flask Server For Home Price Prediction...")
    if util.load_saved_artifacts():
        print("Server is ready to accept requests")
        print("Access the application at: http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("Failed to load artifacts. Server cannot start.")