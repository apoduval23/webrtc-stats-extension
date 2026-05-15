# Connection Health & Insights

## What is it?
Raw network statistics like "RTT: 150ms" or "Packet Loss: 2%" can be confusing if you aren't a network engineer. To fix this, our extension acts as a translator.

### The Traffic Light System
In both the popup and the overlay, you will see a colored dot next to the title. This is your overall connection health at a glance:
- 🟢 **Green (Good)**: Everything is running smoothly.
- 🟡 **Yellow (Moderate)**: The connection is starting to struggle. You might experience minor delays or slight dips in video quality.
- 🔴 **Red (Poor)**: The connection is bad. Video will likely freeze, and audio may become robotic or drop out entirely.

### The Insight Engine
Below the statistics, there is a dedicated message box. Instead of making you figure out *why* the light is Yellow or Red, the Insight Engine tells you directly in plain English. 

**Examples of what you might see:**
- *"Connection is stable."*
- *"High packet loss detected → possible network congestion."* (Meaning your router might be overwhelmed or your Wi-Fi signal is weak).
- *"High latency (RTT) → connection may feel unresponsive."* (Meaning it takes too long for your voice to reach the other person, causing you to accidentally talk over each other).
- *"Low bitrate → possible bandwidth constraint."* (Meaning your internet speed is currently too slow to support high-quality video).

## Why is this useful?
It empowers anyone, regardless of technical skill, to instantly understand what is going wrong with their call and make informed decisions (like moving closer to the Wi-Fi router or turning off their camera to save bandwidth).
