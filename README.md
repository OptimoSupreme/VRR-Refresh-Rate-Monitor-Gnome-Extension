# VRR Refresh Rate Monitor - GNOME Extension

A GNOME Shell extension that monitors and displays the current refresh rate and Variable Refresh Rate (VRR) status in the top panel.

## Features

- 🖥️ **Real-time Refresh Rate Monitoring**: Displays current refresh rate in the top panel
- 🔄 **VRR Detection**: Detects and shows VRR/Adaptive Sync support status
- 📊 **Detailed Information**: Click the indicator for more display information
- ⚡ **Lightweight**: Minimal resource usage with periodic updates
- 🎨 **Clean UI**: Simple and unobtrusive panel indicator

## Requirements

- GNOME Shell 42 or later
- Linux system with display supporting refresh rate querying

## Installation

### Method 1: Manual Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/OptimoSupreme/VRR-Refresh-Rate-Monitor-Gnome-Extension.git
   ```

2. Create the extensions directory if it doesn't exist:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/
   ```

3. Copy the extension to the extensions directory:
   ```bash
   cp -r VRR-Refresh-Rate-Monitor-Gnome-Extension ~/.local/share/gnome-shell/extensions/vrr-monitor@optimosupreme.github.io
   ```

4. Restart GNOME Shell:
   - On X11: Press `Alt+F2`, type `r`, and press Enter
   - On Wayland: Log out and log back in

5. Enable the extension:
   ```bash
   gnome-extensions enable vrr-monitor@optimosupreme.github.io
   ```

   Or use GNOME Extensions app to enable it.

### Method 2: Quick Install Script

Run this one-liner to install the extension:
```bash
cd /tmp && git clone https://github.com/OptimoSupreme/VRR-Refresh-Rate-Monitor-Gnome-Extension.git && mkdir -p ~/.local/share/gnome-shell/extensions/ && cp -r VRR-Refresh-Rate-Monitor-Gnome-Extension ~/.local/share/gnome-shell/extensions/vrr-monitor@optimosupreme.github.io && rm -rf VRR-Refresh-Rate-Monitor-Gnome-Extension && echo "Extension installed! Restart GNOME Shell to use it."
```

## Usage

Once installed and enabled:

1. You'll see the refresh rate (e.g., "144 Hz") displayed in your top panel
2. Click on the indicator to see:
   - Current refresh rate
   - VRR/Adaptive Sync support status
   - Display connector name
3. The indicator updates automatically every 2 seconds

## VRR (Variable Refresh Rate) Support

This extension attempts to detect VRR/Adaptive Sync (FreeSync/G-Sync) support on your display. Note that:

- VRR support requires compatible hardware (GPU and monitor)
- GNOME/Mutter must be running on Wayland for VRR to work
- The detection depends on information exposed by the display driver
- If "Not Detected" is shown, it doesn't necessarily mean VRR isn't working, just that the extension couldn't detect it

## Troubleshooting

### Extension not showing up
- Make sure GNOME Shell is restarted after installation
- Check that the extension is enabled: `gnome-extensions list --enabled`
- Look for errors: `journalctl -f -o cat /usr/bin/gnome-shell`

### Shows "-- Hz" or "Error"
- Verify your display driver is working correctly
- Check that the display configuration DBus service is available
- Some virtual machines may not expose refresh rate information

### VRR always shows "Not Detected"
- Ensure you're running on Wayland (not X11)
- Verify your GPU driver supports VRR
- Check your monitor's OSD to confirm VRR is enabled
- Note: VRR detection depends on driver support and may not work on all systems

## Uninstallation

```bash
gnome-extensions disable vrr-monitor@optimosupreme.github.io
rm -rf ~/.local/share/gnome-shell/extensions/vrr-monitor@optimosupreme.github.io
```

Then restart GNOME Shell.

## Development

The extension uses GNOME's DBus interface to query display configuration from Mutter:
- `org.gnome.Mutter.DisplayConfig` - For display information and modes

### File Structure
```
vrr-monitor@optimosupreme.github.io/
├── extension.js      # Main extension code
├── metadata.json     # Extension metadata
├── stylesheet.css    # UI styling
└── README.md        # This file
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.

## Credits

Created for monitoring VRR and refresh rates on GNOME Shell.