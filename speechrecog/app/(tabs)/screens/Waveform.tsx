import React from 'react';
import { View, StyleSheet } from 'react-native';

type WaveformProps = {
  waveform: number[] | undefined;
};

const Waveform: React.FC<WaveformProps> = ({ waveform }) => {
  if (!waveform || waveform.length === 0) {
    return null;
  }

  // Normalize waveform values between 0 and 1
  const maxVal = Math.max(...waveform);
  const normalized = waveform.map(v => (v / maxVal));

  return (
    <View style={styles.container}>
      {normalized.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: `${value * 100}%`,
              backgroundColor: '#6200ee',
            },
          ]}
        />
      ))}
    </View>
  );
};

export default Waveform;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 100,
    width: '100%',
    marginVertical: 20,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bar: {
    width: 2,
    marginHorizontal: 1,
  },
});
