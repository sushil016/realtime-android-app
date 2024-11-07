import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return styles.secondaryBg;
    case "danger":
      return styles.dangerBg;
    case "success":
      return styles.successBg;
    case "outline":
      return styles.outlineBg;
    default:
      return styles.primaryBg;
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return styles.primaryText;
    case "secondary":
      return styles.secondaryText;
    case "danger":
      return styles.dangerText;
    case "success":
      return styles.successText;
    default:
      return styles.defaultText;
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  style,
  loading = false,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, getBgVariantStyle(bgVariant), style]}
      disabled={loading}
      {...props}
    >
      <View style={styles.contentContainer}>
        {IconLeft && <IconLeft />}
        <Text style={[styles.text, getTextVariantStyle(textVariant)]}>
          {loading ? "Loading..." : title}
        </Text>
        {IconRight && <IconRight />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryBg: {
    backgroundColor: '#0286FF',
  },
  secondaryBg: {
    backgroundColor: '#64748B',
  },
  dangerBg: {
    backgroundColor: '#EF4444',
  },
  successBg: {
    backgroundColor: '#10B981',
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  defaultText: {
    color: '#FFFFFF',
  },
  primaryText: {
    color: '#1a1a1a',
  },
  secondaryText: {
    color: '#F8FAFC',
  },
  dangerText: {
    color: '#FEE2E2',
  },
  successText: {
    color: '#ECFDF5',
  },
});

export default CustomButton;