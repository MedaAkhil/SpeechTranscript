from flask import Flask, request, jsonify
import os
import time
import logging
from transformers import pipeline
from flask_cors import CORS
from pydub import AudioSegment
import numpy as np

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)

try:
    model = pipeline(
        "automatic-speech-recognition",
        model="kattojuprashanth238/whisper-small-te-v10",
        return_timestamps=False  # You can set this True if you want word-level timestamps
    )
    logging.info("Whisper model loaded successfully.")
except Exception as e:
    logging.error(f"Failed to load model: {e}")
    exit()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/collectAudio', methods=['POST'])
def collect_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file uploaded."}), 400

    audio_file = request.files['audio']
    original_filename = f"{int(time.time())}_{audio_file.filename}"
    original_path = os.path.join(UPLOAD_FOLDER, original_filename)
    audio_file.save(original_path)

    try:
        # Convert to mono wav with pydub
        audio = AudioSegment.from_file(original_path)
        audio = audio.set_channels(1).set_frame_rate(16000)  # Recommended for Whisper
        wav_path = original_path.rsplit('.', 1)[0] + '.wav'
        audio.export(wav_path, format='wav')

        # Convert to numpy array
        samples = np.array(audio.get_array_of_samples()).astype(np.float32) / (1 << 15)

        # Get prediction
        result = model(samples)
        transcript = result["text"].strip()
        logging.info(f"Transcript: {transcript}")

        return jsonify({"transcript": transcript}), 200

    except Exception as e:
        logging.error(f"Processing error: {e}")
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route('/test', methods=['GET'])
def test():
    return "Server is running", 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
