// app/(tabs)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store';
import { useTheme } from '../../src/hooks/useTheme';

const ICONS: Record<string, string> = { index: '◈', finder: '⊕', favorites: '♡', profile: '○' };

export default function TabLayout() {
  const { user, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.tabBarBorder,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: c.tabActive,
        tabBarInactiveTintColor: c.tabInactive,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 4,
          fontWeight: '400',
        },
      }}
    >
      {[
        { name: 'index', title: 'Home' },
        { name: 'finder', title: 'Discover' },
        { name: 'favorites', title: 'Saved' },
        { name: 'profile', title: 'Profile' },
      ].map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <Text style={{
                fontSize: 18,
                color: focused ? c.tabActive : c.tabInactive,
                marginTop: 4,
              }}>
                {ICONS[tab.name]}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
