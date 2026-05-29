// =============================================================================
// CANONICAL PUCK USE-SENSORS HOOK
// Mirror of puck-main/packages/core/lib/dnd/use-sensors.ts
// Custom sensors for drag and drop
// =============================================================================

import { useState } from "react";

export interface DelayConstraint {
  value: number;
  tolerance: any;
}

export interface DistanceConstraint {
  value: any;
  tolerance?: any;
}

export interface ActivationConstraints {
  distance?: DistanceConstraint;
  delay?: DelayConstraint;
}

const touchDefault = { delay: { value: 200, tolerance: 10 } };
const otherDefault = {
  delay: { value: 200, tolerance: 10 },
  distance: { value: 5 },
};

export const useSensors = (
  {
    other = otherDefault,
    mouse,
    touch = touchDefault,
  }: {
    mouse?: ActivationConstraints;
    touch?: ActivationConstraints;
    other?: ActivationConstraints;
  } = {
    touch: touchDefault,
    other: otherDefault,
  }
) => {
  const [sensors] = useState(() => [
    // Simplified sensor configuration
    {
      activationConstraints: (event: any, source: any) => {
        const { pointerType, target } = event;

        if (
          pointerType === "mouse" &&
          target &&
          (source.handle === target || source.handle?.contains(target))
        ) {
          return mouse;
        }

        if (pointerType === "touch") {
          return touch;
        }

        return other;
      },
    },
  ]);

  return sensors;
};
