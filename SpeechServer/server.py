# develop an flask that has a route /collectAudio that will be running when a user sends the audio file using post mothod to the /collectaudio path and play the audio when received
from flask import Flask, request, send_file
import os
import time
import shutil
from transformers import pipeline

app = Flask(__name__)

# Load the Hugging Face model pipeline
model = pipeline("automatic-speech-recognition", model="kattojuprashanth238/whisper-small-te-v10")

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

def process_audio(audio_path, name, gender, age, selected_languages, mother_tongue, region, spoken_terms, musical_experience, study_medium):
    try:
        transcription = model(audio_path, return_timestamps=True)["text"]
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        
        line = (f"{os.path.basename(audio_path)} | {timestamp} | {name} | Gender: {gender} | Age: {age} | Mother Tongue: {mother_tongue} | Region: {region} | "
                f"Spoken Terms: {spoken_terms} | Musical Exp: {musical_experience} | Medium of Study: {study_medium} | "
                f"Languages: {', '.join(selected_languages)} | Transcription: {transcription}\n")

        with open(transcript_file_path, "a", encoding="utf-8") as f:
            f.write(line)
        
        return f"Audio saved to: {audio_path}\nTranscription added:\n{line.strip()}"
    except Exception as e:
        return f"Error processing audio: {str(e)}"

@app.route('/collectAudio', methods=['POST'])
def collect_audio():
    if 'audio' not in request.files:
        return "No audio file provided.", 400
    
    audio_file = request.files['audio']
    name = request.form.get('name')
    gender = request.form.get('gender')
    age = request.form.get('age')
    mother_tongue = request.form.get('mother_tongue')
    region = request.form.get('region')
    spoken_terms = request.form.get('spoken_terms')
    musical_experience = request.form.get('musical_experience')
    study_medium = request.form.get('study_medium')
    selected_languages = request.form.getlist('selected_languages')
    
    if not all([name, gender, age, mother_tongue, region, spoken_terms, study_medium]):
        return "Please provide all required details.", 400

    base_name, extension = os.path.splitext(audio_file.filename)
    saved_audio_path = get_unique_filename(audio_storage_path, base_name, extension)
    audio_file.save(saved_audio_path)
    
    result = process_audio(saved_audio_path, name, gender, age, selected_languages, mother_tongue, region, spoken_terms, musical_experience, study_medium)
    
    return result, 200

if __name__ == '__main__':
    app.run(debug=True)
    