import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Props = { base64Svg: string; size?: number };

export default function QrCodeImage({ base64Svg, size = 200 }: Props) {
  const uri = base64Svg.startsWith('data:')
    ? base64Svg
    : `data:image/svg+xml;base64,${base64Svg}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
