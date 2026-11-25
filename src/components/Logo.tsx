import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

const OUTLINE_STEPS = 16;

/**
 * The "voylo." wordmark with its white sticker outline.
 * React Native has no text stroke, so the outline is drawn by
 * layering white copies of the word in a circle behind the black one.
 */
export function Logo({ size = 56 }: { size?: number }) {
  const outline = Math.max(2, Math.round(size * 0.08));
  const textStyle = {
    fontFamily: fonts.display,
    fontSize: size,
    lineHeight: Math.round(size * 1.2),
    letterSpacing: -size * 0.03,
  };

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel="Voylo"
      style={[styles.wrap, { padding: outline }]}
    >
      {Array.from({ length: OUTLINE_STEPS }, (_, i) => {
        const angle = (i / OUTLINE_STEPS) * 2 * Math.PI;
        return (
          <Text
            key={i}
            importantForAccessibility="no"
            accessibilityElementsHidden
            style={[
              textStyle,
              styles.copy,
              {
                left: outline + Math.cos(angle) * outline,
                top: outline + Math.sin(angle) * outline,
              },
            ]}
          >
            voylo.
          </Text>
        );
      })}
      <Text style={[textStyle, { color: colors.black }]}>voylo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start' },
  copy: { position: 'absolute', color: colors.white },
});
