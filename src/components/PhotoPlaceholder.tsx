import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from './AppText';

type Props = {
  label: string;
  color: string;
  textColor?: string;
  style?: ViewStyle;
};

/** Stands in for a photo until the real images from docs/prompts-photos.md arrive. */
export function PhotoPlaceholder({ label, color, textColor = '#000000', style }: Props) {
  return (
    <View style={[styles.box, { backgroundColor: color }, style]} accessibilityLabel={label}>
      <AppText variant="caption" color={textColor}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'flex-end',
    padding: 12,
  },
});
