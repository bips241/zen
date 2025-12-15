/**
 * Spacer Component (Atom)
 *
 * Flexible spacing component
 */

import React from "react";
import { View } from "react-native";
import { spacing, SpacingKey } from "../../theme";

interface SpacerProps {
  size?: SpacingKey;
  horizontal?: boolean;
}

export default function Spacer({
  size = "md",
  horizontal = false,
}: SpacerProps) {
  const dimension = spacing[size];

  return (
    <View
      style={{
        width: horizontal ? dimension : undefined,
        height: !horizontal ? dimension : undefined,
      }}
    />
  );
}
