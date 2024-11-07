import React from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
  loading?: boolean;
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress, style, loading }) => {
  return (
    <button onClick={onPress} style={style}>
      {loading ? 'Loading...' : title}
    </button>
  );
};

export default CustomButton; 