'use client';

import React, { forwardRef } from 'react';
import { 
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  CartesianGrid as RechartsCartesianGrid,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from 'recharts';

// Create wrapper components to avoid dynamic import type issues and properly forward refs
export const LineChart = forwardRef<any, React.ComponentProps<typeof RechartsLineChart>>(
  (props, ref) => <RechartsLineChart {...props} ref={ref} />
);
LineChart.displayName = 'LineChart';

export const Line = forwardRef<any, React.ComponentProps<typeof RechartsLine>>(
  (props, ref) => <RechartsLine {...props} ref={ref} />
);
Line.displayName = 'Line';

export const PieChart = forwardRef<any, React.ComponentProps<typeof RechartsPieChart>>(
  (props, ref) => <RechartsPieChart {...props} ref={ref} />
);
PieChart.displayName = 'PieChart';

export const Pie = forwardRef<any, React.ComponentProps<typeof RechartsPie>>(
  (props, ref) => <RechartsPie {...props} ref={ref} />
);
Pie.displayName = 'Pie';

export const Cell = forwardRef<any, React.ComponentProps<typeof RechartsCell>>(
  (props, ref) => <RechartsCell {...props} ref={ref} />
);
Cell.displayName = 'Cell';

export const ResponsiveContainer = forwardRef<any, React.ComponentProps<typeof RechartsResponsiveContainer>>(
  (props, ref) => <RechartsResponsiveContainer {...props} ref={ref} />
);
ResponsiveContainer.displayName = 'ResponsiveContainer';

export const Tooltip = forwardRef<any, React.ComponentProps<typeof RechartsTooltip>>(
  (props, ref) => <RechartsTooltip {...props} ref={ref} />
);
Tooltip.displayName = 'Tooltip';

export const CartesianGrid = forwardRef<any, React.ComponentProps<typeof RechartsCartesianGrid>>(
  (props, ref) => <RechartsCartesianGrid {...props} ref={ref} />
);
CartesianGrid.displayName = 'CartesianGrid';

export const XAxis = forwardRef<any, React.ComponentProps<typeof RechartsXAxis>>(
  (props, ref) => <RechartsXAxis {...props} ref={ref} />
);
XAxis.displayName = 'XAxis';

export const YAxis = forwardRef<any, React.ComponentProps<typeof RechartsYAxis>>(
  (props, ref) => <RechartsYAxis {...props} ref={ref} />
);
YAxis.displayName = 'YAxis';