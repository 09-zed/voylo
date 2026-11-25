import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type Props = {
  children: ReactNode;
  width?: number;
  tilt?: number;
};

/** A photo taped down like a polaroid: white frame, lime tape, soft shadow. */
export function Polaroid({ children, width = 210, tilt = 4 }: Props) {
  return (
    <View style={[styles.frame, { width, transform: [{ rotate: `${tilt}deg` }] }]}>
      <View style={styles.tape} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.white,
    padding: 10,
    paddingBottom: 40,
    boxShadow: '0 1px 2px rgba(10, 60, 100, 0.16), 0 12px 32px rgba(10, 60, 100, 0.22)',
  },
  tape: {
    position: 'absolute',
    top: -14,
    left: '30%',
    width: 92,
    height: 28,
    backgroundColor: 'rgba(199, 255, 0, 0.85)',
    transform: [{ rotate: '-6deg' }],
    zIndex: 1,
  },
});
