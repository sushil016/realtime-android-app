import { ImageSourcePropType } from 'react-native';

// Import all icons
const icons = {
  list: require('../assets/icons/list.png'),
  back: require('../assets/icons/back-arrow.png'),
  chat: require('../assets/icons/chat.png'),
  check: require('../assets/icons/check.png'),
  close: require('../assets/icons/close.png'),
  dollar: require('../assets/icons/dollar.png'),
  email: require('../assets/icons/email.png'),
  eyecross: require('../assets/icons/eyecross.png'),
  google: require('../assets/icons/google.png'),
  home: require('../assets/icons/home.png'),
  profile: require('../assets/icons/profile.png'),
  pin: require('../assets/icons/pin.png'),
  point: require('../assets/icons/point.png'),
  person: require('../assets/icons/person.png'),
  search: require('../assets/icons/search.png'),
  out: require('../assets/icons/back-arrow.png'), // You might want to add a proper logout icon
} as { [key: string]: ImageSourcePropType };

// Add your images
const images = {
  signUpCar: require('../assets/images/signup-car.png'), // Make sure this image exists
} as { [key: string]: ImageSourcePropType };

export { icons, images };