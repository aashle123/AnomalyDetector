import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import styles from './TrendChart.module.css';

interface TrendData {
    timestamp: string;
    heart_rate: number;
    isAnomaly: boolean;
}

interface TrendChartProps {
    data: TrendData[];
    isLoading?: boolean;
}

export function TrendChart({ data, isLoading }: TrendChartProps) {
    if (isLoading) {
        return <div className={styles.skeletonChart} />;
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.emptyChart}>
                NO HISTORICAL DATA AVAILABLE
            </div>
        );
    }

    // Identify anomaly periods for shading
    const anomalyAreas = data.map((d, index) => {
        if (d.isAnomaly) {
            // Give a little buffer around the anomaly point for a clean visual highlight
            return (
                <ReferenceArea
                    key={index}
                    x1={d.timestamp}
                    x2={data[Math.min(index + 1, data.length - 1)].timestamp}
                    fill="var(--color-anomaly-bg)"
                    fillOpacity={0.5}
                />
            );
        }
        return null;
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const pointData = payload[0].payload;
            return (
                <div className={`${styles.tooltip} ${pointData.isAnomaly ? styles.tooltipAnomaly : ''}`}>
                    <div className={styles.tooltipTime}>{label}</div>
                    <div className={styles.tooltipValue}>
                        <span className={styles.tooltipLabel}>HR</span>
                        {payload[0].value} <span className={styles.tooltipUnit}>bpm</span>
                    </div>
                    {pointData.isAnomaly && (
                        <div className={styles.tooltipWarning}>ANOMALY DETECTED</div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--dashboard-border)" />
                    <XAxis
                        dataKey="timestamp"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--dashboard-text-muted)', fontSize: 10, fontFamily: 'Space Grotesk' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--dashboard-text-muted)', fontSize: 10, fontFamily: 'Space Grotesk' }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--dashboard-border)', strokeWidth: 1, strokeDasharray: '3 3' }} />

                    {anomalyAreas}

                    <Line
                        type="monotone"
                        dataKey="heart_rate"
                        stroke="var(--dashboard-text)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--dashboard-surface)', stroke: 'var(--dashboard-text)', strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: 'var(--dashboard-text)', stroke: 'var(--dashboard-surface)', strokeWidth: 2 }}
                        isAnimationActive={true}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TrendChart;
