import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { ClipPath, Defs, G, Image as SvgImage, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { t } from '@/i18n';
import { colors, fonts, space } from '@/theme';

// The composition is drawn on a 390-wide grid (the mockup) and scaled to the screen width.
const GRID = 390;
const SCENE_HEIGHT = 540;
const BAND_HEIGHT = 156;
// Distance from the bottom of the scene to the bottom of the screen, on the grid.
const SCENE_BOTTOM = 121;

// Soft mountain crest the photo is cut along.
const CREST =
  'M -20 262 C 20 258, 55 222, 95 220 C 128 218, 140 262, 165 266 C 192 270, 214 214, 258 210 C 296 207, 306 262, 334 262 C 358 262, 374 236, 410 232';
const CREST_SHAPE = `${CREST} L 410 600 L -20 600 Z`;

const photo = require('../../assets/photos/bienvenue.jpg');
const person = require('../../assets/photos/bienvenue-personne.png');

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = width / GRID;

  // On short screens (iPhone SE), slide the photo down so the hands stay clear of the title.
  // The bottom of the photo then simply disappears behind the lime band.
  const titleBottom = insets.top + 255;
  const sceneTop = height - SCENE_BOTTOM * scale - SCENE_HEIGHT * scale;
  const handsTop = sceneTop + 165 * scale;
  const sceneBottom = SCENE_BOTTOM * scale - Math.max(0, titleBottom - handsTop);

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + space.s }]}>
        <Logo width={100} onLime />
        <AppText style={[styles.title, { fontSize: Math.round(40 * Math.min(scale, 1.1)) }]} accessibilityRole="header">
          {t('welcome.title')}
        </AppText>
      </View>

      {/* Photo cut along the crest, then the hiker on top so her arms and cap overlap the edge. */}
      <View
        pointerEvents="none"
        style={[styles.scene, { width, height: SCENE_HEIGHT * scale, bottom: sceneBottom }]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width={width} height={SCENE_HEIGHT * scale} viewBox={`0 0 ${GRID} ${SCENE_HEIGHT}`}>
          <Defs>
            <ClipPath id="crest">
              <Path d={CREST_SHAPE} />
            </ClipPath>
          </Defs>
          <G transform="translate(0 8)">
            <Path d={CREST_SHAPE} fill="rgba(47, 74, 0, 0.18)" />
          </G>
          <Path d={CREST_SHAPE} fill={colors.white} />
          <SvgImage href={photo} x={-20} y={0} width={430} height={537.5} preserveAspectRatio="none" clipPath="url(#crest)" />
          <Path d={CREST} fill="none" stroke={colors.white} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
          <SvgImage href={person} x={-20} y={0} width={430} height={537.5} preserveAspectRatio="none" />
        </Svg>

        <Svg
          width={70 * scale}
          height={52 * scale}
          viewBox="0 0 76 56"
          style={[styles.doodle, { left: 40 * scale, top: 135 * scale, transform: [{ rotate: '-14deg' }] }]}
        >
          <Path
            d="M6 40 C 10 14, 22 10, 22 28 C 22 44, 34 40, 36 22 C 38 8, 50 10, 48 26 C 46 40, 60 40, 68 18"
            fill="none"
            stroke={colors.black}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Svg width={58 * scale} height={58 * scale} viewBox="0 0 64 64" style={[styles.doodle, { right: 18 * scale, top: 147 * scale }]}>
          <Path d="M12 30 L4 6 M30 38 L40 12 M42 54 L60 40" fill="none" stroke={colors.black} strokeWidth={6} strokeLinecap="round" />
        </Svg>
      </View>

      <View style={[styles.band, { height: BAND_HEIGHT * scale + insets.bottom }]}>
        <Svg width={width} height={BAND_HEIGHT * scale} viewBox={`0 0 ${GRID} ${BAND_HEIGHT}`} style={StyleSheet.absoluteFill}>
          <Path d="M 0 26 C 60 2, 120 4, 180 20 C 240 36, 300 34, 390 10 L 390 160 L 0 160 Z" fill={colors.lime} />
        </Svg>
        <View style={[styles.actions, { paddingBottom: insets.bottom + space.m }]}>
          <Button label={`${t('welcome.start')}  →`} onPress={() => router.push('/connexion')} />
          <Button label={t('welcome.haveAccount')} variant="link" onPress={() => router.push('/connexion')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.lime, overflow: 'hidden' },
  top: { paddingHorizontal: space.xl - 6, gap: space.l },
  title: {
    fontFamily: fonts.display,
    lineHeight: 42,
    letterSpacing: -0.8,
    maxWidth: 340,
    transform: [{ rotate: '-3deg' }],
  },
  scene: { position: 'absolute', left: 0 },
  doodle: { position: 'absolute' },
  band: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  actions: { position: 'absolute', left: space.xl, right: space.xl, bottom: 0, gap: 4 },
});
