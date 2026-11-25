import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { logoOnLimeXml, logoXml } from './logoXml';

// The logo's drawing is 1495 × 891.
const RATIO = 891 / 1495;

type Props = {
  width?: number;
  /** Use on lime backgrounds, where the lime swoosh would disappear. */
  onLime?: boolean;
};

/** The Voylo logo drawn by the founder (assets/logo/voylo-logo.svg). */
export function Logo({ width = 96, onLime = false }: Props) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Voylo" style={{ width, height: width * RATIO }}>
      <SvgXml xml={onLime ? logoOnLimeXml : logoXml} width={width} height={width * RATIO} />
    </View>
  );
}
