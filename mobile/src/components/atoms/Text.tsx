/**
 * Text Component (Atom)
 *
 * Styled text with typography variants
 */

import React, { forwardRef } from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";
import { colors, typography, TypographyKey } from "../../theme";

interface TextProps extends RNTextProps {
  variant?: TypographyKey;
  color?: string;
  children: React.ReactNode;
}

const Text = forwardRef<RNText, TextProps>(({
  variant = "body",
  color = colors.white,
  style,
  children,
  ...props
}, ref) => {
  return (
    <RNText
      ref={ref}
      style={[styles.base, typography[variant], { color }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
});

export default Text;

const styles = StyleSheet.create({
  base: {
    color: colors.white,
    fontFamily: "ZenDots-Regular", // Default font for all text
  },
});
