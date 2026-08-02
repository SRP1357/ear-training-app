import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function Screen({
  children,
  style,
  topInset = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  topInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: topInset ? Math.max(insets.top, 12) : 8,
          paddingBottom: Math.max(insets.bottom, 24),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export function CardButton({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
      <View style={styles.cardRule} />
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.primaryPressed,
      ]}
    >
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.ghostPressed,
      ]}
    >
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

export function ChoiceButton({
  label,
  onPress,
  state = 'idle',
  disabled,
}: {
  label: string;
  onPress: () => void;
  state?: 'idle' | 'correct' | 'wrong' | 'muted';
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        state === 'correct' && styles.choiceCorrect,
        state === 'wrong' && styles.choiceWrong,
        state === 'muted' && styles.choiceMuted,
        pressed && !disabled && state === 'idle' && styles.choicePressed,
      ]}
    >
      <Text
        style={[
          styles.choiceLabel,
          state === 'correct' && styles.choiceLabelCorrect,
          state === 'wrong' && styles.choiceLabelWrong,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Panel({ children }: { children: React.ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

export function StatusPill({
  tone,
  label,
}: {
  tone: 'neutral' | 'success' | 'danger';
  label: string;
}) {
  return (
    <View
      style={[
        styles.pill,
        tone === 'success' && styles.pillSuccess,
        tone === 'danger' && styles.pillDanger,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          tone === 'success' && styles.pillTextSuccess,
          tone === 'danger' && styles.pillTextDanger,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
  },
  cardPressed: {
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 6,
  },
  cardSub: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  cardRule: {
    marginTop: 14,
    height: 1,
    backgroundColor: colors.line,
    width: 48,
  },
  primary: {
    backgroundColor: colors.ink,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryPressed: {
    opacity: 0.88,
  },
  primaryLabel: {
    fontFamily: fonts.monoMed,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.surfaceRaised,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  ghostPressed: {
    backgroundColor: colors.bgGrid,
  },
  ghostLabel: {
    fontFamily: fonts.monoMed,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  choicePressed: {
    backgroundColor: colors.surface,
  },
  choiceCorrect: {
    backgroundColor: colors.successSoft,
    borderColor: colors.accent,
  },
  choiceWrong: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  choiceMuted: {
    opacity: 0.45,
  },
  choiceLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.ink,
  },
  choiceLabelCorrect: {
    color: colors.accentInk,
  },
  choiceLabelWrong: {
    color: colors.danger,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 14,
  },
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceRaised,
  },
  pillSuccess: {
    borderColor: colors.accent,
    backgroundColor: colors.successSoft,
  },
  pillDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  pillText: {
    fontFamily: fonts.monoMed,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  pillTextSuccess: {
    color: colors.accentInk,
  },
  pillTextDanger: {
    color: colors.danger,
  },
  disabled: {
    opacity: 0.4,
  },
});
