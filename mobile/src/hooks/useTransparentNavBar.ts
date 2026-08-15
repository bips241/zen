import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export function useTransparentNavBar() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // Makes the system nav bar background transparent so the app bleeds perfectly
    NavigationBar.setPositionAsync('absolute');
    NavigationBar.setBackgroundColorAsync('#00000000');
    NavigationBar.setButtonStyleAsync('light'); 
  }, []);
}
