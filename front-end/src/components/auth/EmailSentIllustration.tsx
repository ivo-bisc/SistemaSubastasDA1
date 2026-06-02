import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';

export default function EmailSentIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={styles.envelope}>
        <Ionicons name="mail" size={48} color={Colors.accent} />
      </View>
      <View style={styles.plane}>
        <Ionicons name="paper-plane" size={28} color={Colors.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginVertical: 32,
    position: 'relative',
    width: '100%',
  },
  envelope: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plane: {
    position: 'absolute',
    right: '22%',
    top: 24,
    transform: [{ rotate: '-12deg' }],
  },
});
