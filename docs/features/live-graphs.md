# Live Graphs

## What is it?
At the bottom of the floating overlay, there is a continuously updating visual chart displaying the last 60 seconds of your call's performance.

The graph tracks two crucial metrics:
1. **Bitrate (Blue Line)**: Think of this as the "width of the pipe" currently being used by your call. A higher bitrate means higher quality video and audio. If this line suddenly drops, your video quality is dropping with it.
2. **RTT / Latency (Red Line)**: Think of this as the "speed limit." It measures how many milliseconds it takes for data to travel from your computer to the other person (or server) and back. You want this line to be as low and flat as possible. If this line spikes upwards, you will experience lag.

## Why is this useful?
Looking at numbers changing every second can be hard to track. A graph allows you to spot trends instantly. 
- Did the audio just cut out for a second? You can glance at the graph and see if there was a massive red latency spike 5 seconds ago.
- Is your video looking blurry? You can look at the blue line to see if your bitrate has been steadily declining.

It provides a visual history of your call's stability, making it much easier to diagnose intermittent issues.
