import mime from 'mime';
import React, { useState } from 'react';
import {
  View,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import * as FileSystem from 'expo-file-system';

// Image imports
import green from './green.png';
import red from './red.png';

const server = '192.168.0.112:5000'

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURI, setAudioURI] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Enable microphone permissions.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioURI(uri);
      setRecording(null);
    }
  };

  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.canceled) return;
    setAudioURI(result.assets[0].uri);
  };


  const sendAudioToServer = async () => {
    if (!audioURI) {
      Alert.alert('No audio', 'Please record or upload an audio file.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const mimeType = mime.getType(audioURI) || 'audio/mpeg';
      const fileExtension = mime.getExtension(mimeType) || 'mp3';
  
      // ✅ Declare formData here
      const formData = new FormData();
  
      formData.append('audio', {
        uri: audioURI,
        name: `audio.${fileExtension}`,
        type: mimeType,
      } as any);
  
      const response = await fetch(`http://${server}/collectAudio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.error || 'Transcription failed');
      }
  
      const transcript = responseData.transcript;
  
      navigation.navigate('AudioPreview', {
        audioURI,
        transcript,
      });
  
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };









  
  

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageButton}
        onPress={recording ? stopRecording : startRecording}
      >
        <Image source={recording ? red : green} style={styles.imageIcon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickAudioFile}>
        <Text style={[styles.buttonText, styles.greyText]}>Upload Audio File</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          !audioURI || isLoading ? styles.disabledButton : styles.blueButton,
        ]}
        onPress={sendAudioToServer}
        disabled={!audioURI || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send to Server</Text>
        )}
      </TouchableOpacity>

      {audioURI && <Text style={styles.uriText}>Audio Received</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  imageButton: {
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderStyle: 'solid',
    padding: 20,
    borderRadius: 100,
  },
  imageIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  button: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'green',
    borderStyle: 'solid',
  },
  blueButton: {
    backgroundColor: 'blue',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greyText: {
    color: 'grey',
  },
  uriText: {
    marginTop: 15,
    fontSize: 12,
    color: 'gray',
    marginLeft: 120,
  },
});
