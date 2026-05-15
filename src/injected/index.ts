console.log('WebRTC Stats Extension: Injected Script loaded');

const OriginalRTCPeerConnection = window.RTCPeerConnection;
const peerConnections: Set<RTCPeerConnection> = new Set();

window.RTCPeerConnection = function(...args: any[]) {
  const pc = new OriginalRTCPeerConnection(...(args as any));
  peerConnections.add(pc);

  const cleanup = () => {
    peerConnections.delete(pc);
  };
  
  pc.addEventListener('close', cleanup);
  return pc;
} as any;

window.RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;

const previousStats = new WeakMap<RTCPeerConnection, Map<string, any>>();

function normalizeStats(stats: RTCStatsReport, pc: RTCPeerConnection) {
  const result = {
    video: { bitrate: 0, fps: 0, resolution: '' },
    audio: { bitrate: 0 },
    network: { packetLoss: 0, rtt: 0, jitter: 0 },
    connection: { iceType: '', state: pc.connectionState }
  };

  let prevStatsMap = previousStats.get(pc);
  if (!prevStatsMap) {
    prevStatsMap = new Map();
    previousStats.set(pc, prevStatsMap);
  }

  let totalPacketsSent = 0;
  let totalPacketsLost = 0;
  let maxRtt = 0;
  let maxJitter = 0;

  stats.forEach(stat => {
    const prevStat = prevStatsMap!.get(stat.id);
    
    if (stat.type === 'inbound-rtp') {
      if (stat.kind === 'video') {
        result.video.fps = stat.framesPerSecond || 0;
        if (stat.frameWidth && stat.frameHeight) {
          result.video.resolution = `${stat.frameWidth}x${stat.frameHeight}`;
        }
        if (prevStat) {
          const bytesNow = stat.bytesReceived || 0;
          const bytesPrev = prevStat.bytesReceived || 0;
          const timeNow = stat.timestamp;
          const timePrev = prevStat.timestamp;
          if (timeNow > timePrev) {
            result.video.bitrate = Math.round(((bytesNow - bytesPrev) * 8) / (timeNow - timePrev));
          }
        }
      } else if (stat.kind === 'audio') {
        if (prevStat) {
          const bytesNow = stat.bytesReceived || 0;
          const bytesPrev = prevStat.bytesReceived || 0;
          const timeNow = stat.timestamp;
          const timePrev = prevStat.timestamp;
          if (timeNow > timePrev) {
            result.audio.bitrate = Math.round(((bytesNow - bytesPrev) * 8) / (timeNow - timePrev));
          }
        }
      }
      
      if (stat.jitter) {
        maxJitter = Math.max(maxJitter, stat.jitter * 1000); // ms
      }
      if (typeof stat.packetsLost === 'number') {
        totalPacketsLost += stat.packetsLost;
      }
      if (typeof stat.packetsReceived === 'number') {
        totalPacketsSent += stat.packetsReceived + (stat.packetsLost || 0); // Approx total
      }

    } else if (stat.type === 'outbound-rtp') {
      if (result.video.bitrate === 0 && stat.kind === 'video' && prevStat) {
        const bytesNow = stat.bytesSent || 0;
        const bytesPrev = prevStat.bytesSent || 0;
        const timeNow = stat.timestamp;
        const timePrev = prevStat.timestamp;
        if (timeNow > timePrev) {
          result.video.bitrate = Math.round(((bytesNow - bytesPrev) * 8) / (timeNow - timePrev));
        }
        result.video.fps = stat.framesPerSecond || result.video.fps;
        if (stat.frameWidth && stat.frameHeight) {
          result.video.resolution = `${stat.frameWidth}x${stat.frameHeight}`;
        }
      } else if (result.audio.bitrate === 0 && stat.kind === 'audio' && prevStat) {
        const bytesNow = stat.bytesSent || 0;
        const bytesPrev = prevStat.bytesSent || 0;
        const timeNow = stat.timestamp;
        const timePrev = prevStat.timestamp;
        if (timeNow > timePrev) {
          result.audio.bitrate = Math.round(((bytesNow - bytesPrev) * 8) / (timeNow - timePrev));
        }
      }
    } else if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
      if (stat.currentRoundTripTime) {
         maxRtt = Math.max(maxRtt, stat.currentRoundTripTime * 1000); // ms
      }
      if (stat.localCandidateId && stat.remoteCandidateId) {
         const local = stats.get(stat.localCandidateId);
         const remote = stats.get(stat.remoteCandidateId);
         if (local && remote) {
           result.connection.iceType = `${local.candidateType || 'unknown'} <-> ${remote.candidateType || 'unknown'}`;
         }
      }
    } else if (stat.type === 'remote-inbound-rtp') {
      if (stat.roundTripTime) {
        maxRtt = Math.max(maxRtt, stat.roundTripTime * 1000);
      }
    }
    
    prevStatsMap!.set(stat.id, stat);
  });

  if (totalPacketsSent > 0) {
     result.network.packetLoss = Number(((totalPacketsLost / totalPacketsSent) * 100).toFixed(2));
  }
  result.network.rtt = Math.round(maxRtt);
  result.network.jitter = Math.round(maxJitter);

  return result;
}

setInterval(async () => {
  if (peerConnections.size === 0) return;

  let activePc: RTCPeerConnection | null = null;
  for (const pc of peerConnections) {
    if (pc.connectionState === 'connected' || pc.connectionState === 'connecting') {
      activePc = pc;
      break;
    }
  }

  if (!activePc) {
    activePc = Array.from(peerConnections)[0];
  }

  if (activePc) {
    try {
      const stats = await activePc.getStats();
      const normalized = normalizeStats(stats, activePc);
      
      window.postMessage({
        source: 'webrtc-stats-injected',
        type: 'WEBRTC_STATS_UPDATE',
        data: {
          ...normalized,
          platform: window.location.hostname
        }
      }, '*');
    } catch (e) {
      console.warn('Failed to get stats', e);
    }
  }
}, 1000);
