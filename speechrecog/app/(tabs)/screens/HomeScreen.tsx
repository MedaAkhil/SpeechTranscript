import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURI, setAudioURI] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Please enable microphone permissions.');
        return;
      }

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

  const goToPreview = () => {
    if (audioURI) {
      navigation.navigate('AudioPreview', { audioURI });
    } else {
      Alert.alert('No audio', 'Please record or upload an audio file.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Start Recording" onPress={startRecording} disabled={!!recording} />
      <Button title="Stop Recording" onPress={stopRecording} disabled={!recording} />
      <Button title="Upload Audio File" onPress={pickAudioFile} />
      <Button title="Go to Preview" onPress={goToPreview} disabled={!audioURI} />
    </View>
  );
}
