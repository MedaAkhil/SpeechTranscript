import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import Waveform from './Waveform';

type AudioPreviewProps = {
  route: RouteProp<RootStackParamList, 'AudioPreview'>;
};

export default function AudioPreviewScreen({ route }: AudioPreviewProps) {
  const { audioURI, transcript, waveform } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const loadAudio = async () => {
      const { sound } = await Audio.Sound.createAsync({ uri: audioURI });
      setSound(sound);
    };

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioURI]);

  const playAudio = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  useEffect(() => {
    console.log("Waveform data in preview screen:", waveform);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Audio Preview</Text>

      <Waveform waveform={waveform} />

      <Text style={styles.debugTitle}>Waveform Data:</Text>
      <Text style={styles.debug}>{JSON.stringify(waveform)}</Text>

      <Button title="Play Audio" onPress={playAudio} />

      <Text style={styles.transcriptTitle}>Transcript:</Text>
      <Text style={styles.transcript}>{transcript}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  transcriptTitle: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
  },
  transcript: {
    marginTop: 10,
    fontSize: 14,
  },
  debugTitle: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  debug: {
    fontSize: 12,
    color: '#666',
  },
});
