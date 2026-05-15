export interface HealthStatus {
  status: 'good' | 'moderate' | 'poor';
  insight: string;
  insightClass: string;
}

const PlatformThresholds: Record<string, any> = {
  'discord.com': {
    rtt: { moderate: 80, poor: 150 },
    loss: { moderate: 1, poor: 3 }
  },
  'meet.google.com': {
    rtt: { moderate: 150, poor: 300 },
    loss: { moderate: 2, poor: 5 }
  },
  'default': {
    rtt: { moderate: 100, poor: 300 },
    loss: { moderate: 1, poor: 5 }
  }
};

export function computeHealth(stats: any, hostname: string): HealthStatus {
  const profile = PlatformThresholds[hostname] || PlatformThresholds['default'];
  
  const loss = stats.network?.packetLoss || 0;
  const rtt = stats.network?.rtt || 0;
  const bitrate = stats.video?.bitrate || 0;
  const fps = stats.video?.fps || 0;
  const iceType = stats.connection?.iceType || '';

  let status: 'good' | 'moderate' | 'poor' = 'good';
  let insight = 'Connection is stable.';
  let insightClass = '';

  if (loss > profile.loss.poor || rtt > profile.rtt.poor) {
    status = 'poor';
    insightClass = 'critical';
    if (loss > profile.loss.poor) insight = 'High packet loss detected → possible network congestion.';
    else insight = 'High latency (RTT) → connection may feel unresponsive.';
  } else if (loss > profile.loss.moderate || rtt > profile.rtt.moderate) {
    status = 'moderate';
    insightClass = 'warning';
    if (loss > profile.loss.moderate) insight = 'Moderate packet loss → video/audio may stutter.';
    else insight = 'Elevated latency → minor delays expected.';
  } else if (iceType && iceType.includes('relay')) {
    insightClass = 'warning';
    insight = 'Using TURN relay → increased latency expected.';
  } else if (bitrate > 0 && bitrate < 100000 && fps > 0) {
    insightClass = 'warning';
    insight = 'Low bitrate → possible bandwidth constraint.';
  }

  return { status, insight, insightClass };
}
