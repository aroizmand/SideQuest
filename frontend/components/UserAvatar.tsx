import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type Props = {
  name: string;
  photo: string | null;
  size?: number;
  verified?: boolean;
  onPress?: () => void;
};

export function UserAvatar({ name, photo, size = 40, verified = false, onPress }: Props) {
  const shieldIconSize = Math.round(size * 0.32);
  const shieldContainerSize = Math.round(size * 0.44);
  const shieldOffset = -Math.round(size * 0.07);

  const inner = (
    <View style={{ width: size, height: size }}>
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{
            width: size, height: size,
            borderRadius: size / 2,
            borderWidth: 2, borderColor: Colors.border,
          }}
        />
      ) : (
        <View style={[styles.initials, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={{ color: Colors.text, fontSize: size * 0.38, fontWeight: '800' }}>
            {name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}

      {verified && (
        <View style={[styles.shield, {
          width: shieldContainerSize,
          height: shieldContainerSize,
          borderRadius: shieldContainerSize / 2,
          bottom: shieldOffset,
          right: shieldOffset,
        }]}>
          <Ionicons name="shield-checkmark" size={shieldIconSize} color={Colors.success} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  initials: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  shield: {
    position: 'absolute',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
});
