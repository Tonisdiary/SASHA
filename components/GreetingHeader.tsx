import { Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';

export function GreetingHeader() {
  const hour = new Date().getHours();
  
  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return <Text style={styles.greeting}>{getGreeting()}!</Text>;
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1e293b',
  },
});