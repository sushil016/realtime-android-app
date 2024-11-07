import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Line = ({ label = "or" }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  text: {
    marginHorizontal: 16,
    color: '#64748B',
    fontSize: 14,
  },
});

export default Line;