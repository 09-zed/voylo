import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';
import { AppText } from './AppText';

export type Member = { id: string; name: string; color: string };

/** Overlapping round avatars with initials (real photos come later). */
export function AvatarStack({ members, size = 40 }: { members: Member[]; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={members.map((m) => m.name).join(', ')}>
      {members.map((m, i) => {
        const dark = m.color === colors.black;
        return (
          <View
            key={m.id}
            style={[
              styles.avatar,
              {
                width: size,
                height: size,
                backgroundColor: m.color,
                marginLeft: i === 0 ? 0 : -size / 4,
              },
            ]}
          >
            <AppText variant="caption" color={dark ? colors.white : colors.black}>
              {m.name.charAt(0)}
            </AppText>
          </View>
        );
      })}
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
