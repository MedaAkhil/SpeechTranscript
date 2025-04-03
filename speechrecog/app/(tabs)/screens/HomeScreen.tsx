import React, { useState } from 'react';
import { View, Button, Alert, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import * as FileSystem from 'expo-file-system';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURI, setAudioURI] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Please enable microphone permissions.');
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
      setAudioURI(recording.getURI() || null);
      setRecording(null);
    }
  };

  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.canceled) return;
    setAudioURI(result.assets[0].uri);
  };

  const sendAudioToServer = async (uri: string) => {
    setIsLoading(true);
    setTranscript(null);
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        Alert.alert('Error', 'Audio file does not exist.');
        return;
      }
      const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        name: 'audio.wav',
        type: 'audio/wav',
        
      } as any);

      const response = await fetch('http://192.168.0.114:5000/collectAudio', { // Replace with your server IP
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Start Recording" onPress={startRecording} disabled={!!recording} />
      <Button title="Stop Recording" onPress={stopRecording} disabled={!recording} />
      <Button title="Upload Audio File" onPress={pickAudioFile} />
      <Button
        title="Send to Server"
        onPress={() => {
          if (audioURI) {
            sendAudioToServer(audioURI);
          } else {
            Alert.alert('No audio', 'Please record or upload an audio file.');
          }
        }}
        disabled={!audioURI || isLoading}
      />
      {isLoading && <Text>Loading...use_reloader=False</Text>}
      {transcript && <Text>Transcript: {transcript}</Text>}
    </View>
  );
}
