import React from 'react';
import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  themeColor?: ThemeColor;
  type?: 'background' | 'backgroundCard' | 'backgroundElevated';
};

export function ThemedView({ style, themeColor, type = 'background', ...rest }: ThemedViewProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme[themeColor ?? type] },
        style,
      ]}
      {...rest}
    />
  );
}
