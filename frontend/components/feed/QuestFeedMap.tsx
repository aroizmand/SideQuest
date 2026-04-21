import { StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { CALGARY_BOUNDS } from '@/constants/options';

const INITIAL_REGION: Region = {
  latitude: CALGARY_BOUNDS.center.lat,
  longitude: CALGARY_BOUNDS.center.lng,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

interface Props {
  quests: any[];
}

export function QuestFeedMap({ quests }: Props) {
  const router = useRouter();

  return (
    <MapView
      style={styles.map}
      initialRegion={INITIAL_REGION}
      userInterfaceStyle="dark"
    >
      {quests.map(q => (
        <Marker
          key={q.quest_id}
          coordinate={{ latitude: q.lat_area, longitude: q.lng_area }}
          title={q.title}
          description={q.category}
          pinColor="#FF5C00"
          onCalloutPress={() => router.push(`/(app)/feed/quest/${q.quest_id}`)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
