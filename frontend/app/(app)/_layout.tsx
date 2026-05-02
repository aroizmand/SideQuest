import { useEffect } from "react";
import { Redirect, Tabs, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "@/stores/authStore";
import { useRegisterPushToken } from "@/hooks/usePushNotifications";
import { Colors } from "@/constants/theme";

function TabButton({
  onPress,
  iconName,
  label,
  routeName,
}: {
  onPress: () => void;
  iconName: string;
  label: string;
  routeName: string;
}) {
  const pathname = usePathname();
  const focused =
    pathname === `/${routeName}` || pathname.startsWith(`/${routeName}/`);
  const color = focused ? Colors.text : Colors.cream;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 4,
          borderTopWidth: focused ? 2 : 0,
          borderLeftWidth: focused ? 2 : 0,
          borderBottomWidth: focused ? 4 : 0,
          borderRightWidth: focused ? 4 : 0,
          borderColor: Colors.border,
          backgroundColor: focused ? Colors.background : "transparent",
          gap: 2,
          minWidth: 56,
        }}
      >
        <Ionicons name={iconName as any} size={20} color={color} />
        <Text
          style={{ color, fontSize: 10, fontWeight: focused ? "700" : "500" }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function CreateTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          width: 58,
          height: 58,
          marginTop: -28,
          borderRadius: 4,
          backgroundColor: Colors.surface,
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderBottomWidth: 5,
          borderRightWidth: 5,
          borderColor: Colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="add" size={28} color={Colors.text} />
      </View>
    </TouchableOpacity>
  );
}

export default function AppLayout() {
  const { session, initialized, hasProfile } = useAuthStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useRegisterPushToken();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data as { quest_id?: string; quest_title?: string };
      if (data?.quest_id) {
        router.push({
          pathname: '/messages/[questId]',
          params: { questId: data.quest_id, title: data.quest_title ?? 'Chat' },
        } as any);
      }
    });
    return () => sub.remove();
  }, []);

  if (!initialized) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!hasProfile) return <Redirect href="/(auth)/onboarding/profile-setup" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primaryDark,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Explore",
          tabBarButton: ({ onPress }) => (
            <TabButton
              onPress={onPress as any}
              iconName="compass"
              label="Explore"
              routeName="feed"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-quests"
        options={{
          title: "Quests",
          tabBarButton: ({ onPress }) => (
            <TabButton
              onPress={onPress as any}
              iconName="flag"
              label="Quests"
              routeName="my-quests"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarButton: ({ onPress }) => (
            <CreateTabButton onPress={onPress as any} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarButton: ({ onPress }) => (
            <TabButton
              onPress={onPress as any}
              iconName="chatbubble"
              label="Chats"
              routeName="messages"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarButton: ({ onPress }) => (
            <TabButton
              onPress={onPress as any}
              iconName="person"
              label="Me"
              routeName="profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}
