import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type AudioPreviewProps = {
  route: RouteProp<RootStackParamList, 'AudioPreview'>;
};

export default function AudioPreviewScreen({ route }: AudioPreviewProps) {
  const { audioURI } = route.params;
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Audio Preview</Text>
      <Text>{audioURI}</Text>
      <Button title="Play Audio" onPress={playAudio} />
    </View>
  );
}
