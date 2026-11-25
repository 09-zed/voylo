import { StyleSheet, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { AppText } from './AppText';

export type Member = { id: string; name: string; color: string };

type Props = {
  members: Member[];
  size?: number;
  /** Beyond this many, the rest are summed up as "+N". */
  max?: number;
};

/** Overlapping round avatars with initials (real photos come later). */
export function AvatarStack({ members, size = 40, max = 6 }: Props) {
  const shown = members.slice(0, max);
  const hidden = members.length - shown.length;

  return (
    <View style={styles.row} accessibilityLabel={members.map((m) => m.name).join(', ')}>
      {shown.map((m, i) => (
        <Bubble key={m.id} size={size} color={m.color} first={i === 0}>
          {m.name.charAt(0).toUpperCase()}
        </Bubble>
      ))}
      {hidden > 0 && (
        <Bubble size={size} color={colors.surface} first={false}>
          {`+${hidden}`}
        </Bubble>
      )}
    </View>
  );
}

function Bubble({ size, color, first, children }: { size: number; color: string; first: boolean; children: string }) {
  const dark = color === colors.black;
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, backgroundColor: color, marginLeft: first ? 0 : -size / 4 },
      ]}
    >
      <AppText
        style={{ fontFamily: fonts.bodyStrong, fontSize: Math.round(size * 0.38), lineHeight: Math.round(size * 0.5) }}
        color={dark ? colors.white : colors.black}
      >
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  avatar: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
