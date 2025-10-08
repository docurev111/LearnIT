/**
 * ComponentName.tsx
 * 
 * Brief description of what this component does and when to use it.
 * 
 * @component
 * @example
 * ```tsx
 * <ComponentName 
 *   propName="value"
 *   onAction={handleAction}
 * />
 * ```
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Props interface for ComponentName
 */
interface ComponentNameProps {
  /** Description of prop1 */
  prop1: string;
  /** Description of prop2 */
  prop2?: number;
  /** Callback when action occurs */
  onAction?: () => void;
}

/**
 * ComponentName component description
 * 
 * @param props - Component props
 * @returns Rendered component
 */
export default function ComponentName({ 
  prop1, 
  prop2 = 0, 
  onAction 
}: ComponentNameProps) {
  
  // Component logic here
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{prop1}</Text>
      {/* Component JSX */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Styles
  },
  text: {
    // Styles
  },
});
