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
  out: require('../assets/icons/logout.png'),
  building: require('../assets/icons/building.png'),
  history: require('../assets/icons/history.png'),
  bell: require('../assets/icons/bell.png'),
  user: require('../assets/icons/user.png'),
} as { [key: string]: ImageSourcePropType };

// Add your images
const images = {
  signUpCar: require('../assets/images/signup-car.png'), // Make sure this image exists
} as { [key: string]: ImageSourcePropType };

export const onboarding = [
  {
    id: "1",
    title: "Track Your Location",
    description: "Keep track of your location and stay within your designated zones",
    image: images.signUpCar // or any other relevant image from your assets
  },
  {
    id: "2",
    title: "Stay Connected",
    description: "Get real-time updates and notifications about your location status",
    image: images.signUpCar // replace with appropriate image
  },
  {
    id: "3",
    title: "View Statistics",
    description: "Access detailed statistics about your location history and patterns",
    image: images.signUpCar // replace with appropriate image
  }
];

export const endpoints = {
  // ... other endpoints
  activities: '/api/activities', // Update this to match your backend route
};

export { icons, images };