# develop an flask that has a route /collectAudio that will be running when a user sends the audio file using post mothod to the /collectaudio path and play the audio when received
from flask import Flask, request, send_file, jsonify
import os
import time
import shutil
from transformers import pipeline
from flask_cors import CORS  # Import CORS
from io import BytesIO
import logging
import librosa # Import librosa

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG

# Load the Hugging Face model pipeline
try:
    model = pipeline("automatic-speech-recognition", model="kattojuprashanth238/whisper-small-te-v10")
    logging.info("Whisper model loaded successfully.")
except Exception as e:
    logging.error(f"Error loading Whisper model: {e}")
    exit()  # Exit if the model fails to load

# Define paths for storing transcripts and audio files
transcript_file_path = "transcripts/consolidated_transcript_hcu.txt"
audio_storage_path = "audio_files_hcu"
os.makedirs("transcripts", exist_ok=True)
os.makedirs(audio_storage_path, exist_ok=True)

# Ensure the consolidated transcript file exists
if not os.path.exists(transcript_file_path):
    with open(transcript_file_path, "w", encoding="utf-8") as f:
        f.write("")  # Create an empty file

def get_unique_filename(folder, base_name, extension):
    """Generate a unique filename by appending a timestamp if necessary."""
    timestamp = int(time.time() * 1000)  # Milliseconds since epoch
    unique_name = f"{base_name}_{timestamp}{extension}"
    return os.path.join(folder, f"{base_name}_{timestamp}{extension}")

def process_audio(audio_path):
    try:
        logging.debug(f"Processing audio file: {audio_path}")
        # Load the audio file using librosa to handle various formats and resample if needed
        audio_data, sample_rate = librosa.load(audio_path, sr=16000)  # Resample to 16kHz if necessary

        # Transcribe the audio
        transcription = model(audio_data, chunk_length_s=30, stride_length_s=5, return_timestamps=True)["text"]
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        
        line = (f"{os.path.basename(audio_path)} | {timestamp} | Transcription: {transcription}\n")

        with open(transcript_file_path, "a", encoding="utf-8") as f:
            f.write(line)
        
        logging.debug(f"Transcription successful: {transcription}")
        return {
            "message": f"Audio saved to: {audio_path}\nTranscription added.",
            "transcript": transcription,
            "details": line.strip()
        }
    except Exception as e:
        logging.error(f"Error processing audio: {e}")
        return {"error": f"Error processing audio: {str(e)}"}, 500

@app.route('/test', methods=['GET'])
def test():
    return "Test route is working!", 200
    

@app.route('/collectAudio', methods=['POST'])
def collect_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided."}), 400
    
    audio_file = request.files['audio']
    
    base_name, extension = os.path.splitext(audio_file.filename)
    saved_audio_path = get_unique_filename(audio_storage_path, base_name, extension)
    audio_file.save(saved_audio_path)
    
    result = process_audio(saved_audio_path)
    
    if "error" in result:
        return jsonify(result), result.get("error", 500)
    
    # Send the audio file back to the client
    try:
        return_data = BytesIO()
        with open(saved_audio_path, 'rb') as audio_file_to_send:
            return_data.write(audio_file_to_send.read())
        return_data.seek(0)
        
        response = send_file(
            return_data,
            mimetype="audio/wav",  # Adjust mimetype if necessary
            as_attachment=True,
            download_name=os.path.basename(saved_audio_path)
        )
        response.headers.add('transcript', result['transcript'])
        response.headers.add('message', result['message'])
        response.headers.add('details', result['details'])
        return response
    except Exception as e:
        logging.error(f"Error sending audio file: {e}")
        return jsonify({"error": f"Error sending audio file: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', use_reloader=False)
