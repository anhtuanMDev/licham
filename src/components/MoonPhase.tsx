import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Circle, Path, Paint, SweepGradient, vec, Group } from '@shopify/react-native-skia';

interface MoonPhaseProps {
  lunarDay: number;
  size?: number;
}

export const MoonPhase: React.FC<MoonPhaseProps> = ({ lunarDay, size = 100 }) => {
  const r = size / 2;
  const center = vec(r, r);
  
  // Calculate the phase percentage (0.0 to 1.0)
  // Day 1 = 0% (New Moon), Day 15 = 100% (Full Moon), Day 30 = 0% (New Moon)
  // For simplicity, we assume a 30-day lunar month.
  let percentage = 0;
  if (lunarDay <= 15) {
    percentage = lunarDay / 15.0; // 0.0 -> 1.0
  } else {
    percentage = (30 - lunarDay) / 15.0; // 1.0 -> 0.0
  }
  
  // Ensure we don't divide by zero or have weird bounds
  percentage = Math.max(0.01, Math.min(0.99, percentage));

  // The shadow is drawn as a path covering the non-illuminated part
  // A simplified approach: we scale the shadow ellipse width based on percentage.
  // When percentage = 1 (Full moon), shadow is 0 width.
  // When percentage = 0.5 (Half moon), shadow covers half.
  const shadowWidth = r * (1 - percentage) * 2;
  const shadowX = r - shadowWidth / 2;
  
  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ flex: 1 }}>
        <Group>
          {/* Base Moon Glow (Bright) */}
          <Circle c={center} r={r} color="#FFE5b4">
            <Paint style="fill">
              <SweepGradient
                c={center}
                colors={['#fff5e6', '#ffe0a3', '#fff5e6']}
              />
            </Paint>
          </Circle>

          {/* Shadow mask simulating the phase */}
          {percentage < 1.0 && percentage > 0.0 && (
            <Path
              path={`M ${r} 0 
                    A ${shadowWidth / 2} ${r} 0 0 ${percentage > 0.5 ? 1 : 0} ${r} ${size}
                    A ${r} ${r} 0 0 1 ${r} 0 Z`}
              color="rgba(0,0,0,0.7)"
            />
          )}
        </Group>
      </Canvas>
    </View>
  );
};
