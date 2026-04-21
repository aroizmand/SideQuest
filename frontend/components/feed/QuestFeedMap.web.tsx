import { View, Text, StyleSheet } from 'react-native';

export function QuestFeedMap(_props: { quests: any[] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map view is available on the mobile app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0D0D' },
  text: { color: '#666', fontSize: 15 },
});
