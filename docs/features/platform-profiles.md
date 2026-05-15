# Platform-Specific Smart Profiles

## What is it?
Not all internet calls are created equal. Different platforms are built for different purposes, which means what counts as a "Bad" connection on one platform might be completely acceptable on another.

The extension automatically detects which website you are using (like Discord or Google Meet) and silently swaps out its grading criteria behind the scenes.

### Example: Discord vs. Google Meet
- **Discord**: Built for gamers. Gamers need lightning-fast reaction times. Therefore, Discord is highly sensitive to latency (lag). If your data takes more than 150 milliseconds to reach the server, the extension will flag your connection as **Poor**, because 150ms of lag in a fast-paced game is very noticeable.
- **Google Meet**: Built for video conferences and meetings. A slight delay in someone's voice isn't the end of the world, but if video packets are lost, the screen will freeze or glitch. Therefore, Google Meet can tolerate up to 300 milliseconds of lag before the extension flags it as **Poor**, but it is much stricter on grading "Packet Loss."

## Why is this useful?
Without smart profiles, a tool like this would constantly give you false alarms. It might yell at you for having 200ms of lag on a Google Meet call, even though the call feels perfectly fine. By using smart profiles, the tool's Traffic Light system is always accurate for the specific app you are using.
