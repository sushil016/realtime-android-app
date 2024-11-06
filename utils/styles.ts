import { StyleSheet } from 'react-native';

export const createStyleSheet = (styles: any) => StyleSheet.create(styles);

export const convertClassNameToStyle = (className: string) => {
  // This is a simplified version - you'll need to expand this based on your needs
  const styles: any = {};
  const classes = className.split(' ');
  
  classes.forEach(cls => {
    if (cls.includes('bg-')) {
      styles.backgroundColor = convertColor(cls.replace('bg-', ''));
    }
    if (cls.includes('text-')) {
      styles.fontSize = convertFontSize(cls.replace('text-', ''));
    }
    // Add more conversions as needed
  });
  
  return styles;
};

const convertColor = (color: string) => {
  // Add color conversion logic
  return color;
};

const convertFontSize = (size: string) => {
  const sizes: {[key: string]: number} = {
    'xl': 20,
    '2xl': 24,
    '3xl': 30
  };
  return sizes[size] || 16;
}; 