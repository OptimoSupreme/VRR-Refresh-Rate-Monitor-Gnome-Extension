# VRR Monitor for GNOME

A simple GNOME Shell extension that displays the current refresh rate (Hz) on the top bar. This extension includes a real-time graph of refresh intervals and a numeric display, making it useful for verifying Variable Refresh Rate (VRR) functionality.

![VRR Monitor Screenshot](screenshots/screenshot.png)


## Compatibility
| GNOME Version | Status |
|---|---|
| 47 | ❌ Not Compatible |
| 48 | ✅ Compatible |
| 49 | ✅ Compatible |

## How It Works (Disclaimer)
This extension monitors the GNOME Shell compositor's frame rendering timing to estimate the current refresh rate, it is not an exact 1:1 measurement of your monitor's real world refresh rate. In a VRR setup, your monitor effectively syncs to this rate, so it's pretty close. This is a limitation of the compositor's API, as it's currently not possible to get an exact measurement of the refresh rate.

## Installation
You can install this extension directly from the GNOME Extensions website:
[Install VRR Monitor](https://extensions.gnome.org/extension/9220/vrr-refresh-rate-monitor/)
