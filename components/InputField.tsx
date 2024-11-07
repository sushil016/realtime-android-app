import { View, TextInput, Image, StyleSheet } from 'react-native';
import React from 'react';

const InputField = ({ label, icon, ...props }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {icon && <Image source={icon} style={styles.icon} />}
        <TextInput
          placeholder={label}
          placeholderTextColor="#666"
          style={styles.input}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#666',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
});

export default InputField;