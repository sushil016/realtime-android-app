export interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: any;
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  bgVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  textVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'default';
  loading?: boolean;
} 