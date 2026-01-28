# VRR Monitor for GNOME

A simple GNOME Shell extension that displays the current refresh rate (Hz) on the top bar. Useful for verifying Variable Refresh Rate (VRR) functionality.

## Installation

This extension does not require compilation. You can install it by linking the source directory to your local GNOME extensions folder.

### 1. Link the Extension
Run the following command in your terminal:
```bash
ln -s "/home/justin/git/vrr" ~/.local/share/gnome-shell/extensions/vrr-monitor@antigravity.dev
```

### 2. Restart GNOME Shell
*   **Wayland**: Log out and log back in.
*   **X11**: Press `Alt` + `F2`, type `r`, and press `Enter`.

### 3. Enable the Extension
Enable it using the Extensions app or the command line:
```bash
gnome-extensions enable vrr-monitor@antigravity.dev
```

## Troubleshooting
If the extension doesn't appear:
1.  Check if it's listed in `gnome-extensions list`.
2.  Check for errors in Looking Glass (`Alt` + `F2`, type `lg`).
