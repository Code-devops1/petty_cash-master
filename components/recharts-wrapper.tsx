'use client';

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

// Create wrapper components to avoid dynamic import type issues
// Note: Not using forwardRef as recharts components don't support ref forwarding
export const LineChart = (props: React.ComponentProps<typeof RechartsLineChart>) => <RechartsLineChart {...props} />;
export const Line = (props: React.ComponentProps<typeof RechartsLine>) => <RechartsLine {...props} />;
export const PieChart = (props: React.ComponentProps<typeof RechartsPieChart>) => <RechartsPieChart {...props} />;
export const Pie = (props: React.ComponentProps<typeof RechartsPie>) => <RechartsPie {...props} />;
export const Cell = (props: React.ComponentProps<typeof RechartsCell>) => <RechartsCell {...props} />;
export const ResponsiveContainer = (props: React.ComponentProps<typeof RechartsResponsiveContainer>) => <RechartsResponsiveContainer {...props} />;
export const Tooltip = (props: React.ComponentProps<typeof RechartsTooltip>) => <RechartsTooltip {...props} />;
export const CartesianGrid = (props: React.ComponentProps<typeof RechartsCartesianGrid>) => <RechartsCartesianGrid {...props} />;
export const XAxis = (props: React.ComponentProps<typeof RechartsXAxis>) => <RechartsXAxis {...props} />;
export const YAxis = (props: React.ComponentProps<typeof RechartsYAxis>) => <RechartsYAxis {...props} />;