import { Box } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { TrendChartTypes } from '../types';

type Props = {
    trendChartData?: TrendChartTypes[];
};

export const TrendGraph = ({ trendChartData }: Props) => {
    return (
        <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={trendChartData}>
                    <defs>
                        <linearGradient
                            id="trendGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.4}
                            />
                            <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        padding={{ left: 10, right: 10 }}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: 8,
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#trendGradient)"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};
