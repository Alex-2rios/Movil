import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import PantallaMenu from './screens/PantallaMenu';

export default function App() {
  return (
    <View style={styles.container}>
      <PantallaMenu />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDD',
  },
});
