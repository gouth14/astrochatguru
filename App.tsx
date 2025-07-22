import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import HomeScreen from "./screens/HomeScreen"
import ChatScreen from "./screens/ChatScreen"

// Define the navigation param list type
export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{
    headerShown: false
  }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

// Suppress IAP Storage errors from Expo Go
LogBox.ignoreLogs([
  '[IAP Storage]',
  'timeout of 30000ms occured while fetching resource',
  'cannot fetch resource',
]);

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
      <Toaster />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});