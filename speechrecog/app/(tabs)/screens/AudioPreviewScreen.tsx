import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type AudioPreviewProps = {
  route: RouteProp<RootStackParamList, 'AudioPreview'>;
};

export default function AudioPreviewScreen({ route }: AudioPreviewProps) {
  const { audioURI, transcript } = route.params;
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Preview</Text>
      <Button title="Play Audio" onPress={playAudio} />
      <Text style={styles.transcriptTitle}>Transcript:</Text>
      <Text style={styles.transcript}>{transcript}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
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
});
