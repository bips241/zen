/**
 * Text Component (Atom)
 *
 * Styled text with typography variants
 */

import React from "react";
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

export default function Text({
  variant = "body",
  color = colors.white,
  style,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[styles.base, typography[variant], { color }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.white,
  },
});
