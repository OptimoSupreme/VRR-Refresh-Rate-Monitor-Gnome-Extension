/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const GETTEXT_DOMAIN = 'vrr-monitor';

const { GObject, St, Gio, GLib, Meta } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('VRR Monitor'));

        // Create label for the panel
        this._label = new St.Label({
            text: _('-- Hz'),
            y_align: St.Align.CENTER,
            style_class: 'vrr-monitor-label'
        });
        this.add_child(this._label);

        // Create menu items
        this._refreshRateItem = new PopupMenu.PopupMenuItem(_('Refresh Rate: -- Hz'), {
            reactive: false
        });
        this.menu.addMenuItem(this._refreshRateItem);

        this._vrrStatusItem = new PopupMenu.PopupMenuItem(_('VRR Status: Unknown'), {
            reactive: false
        });
        this.menu.addMenuItem(this._vrrStatusItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._displayNameItem = new PopupMenu.PopupMenuItem(_('Display: --'), {
            reactive: false
        });
        this.menu.addMenuItem(this._displayNameItem);

        // Initialize display config proxy
        this._initDisplayConfig();

        // Update display info
        this._updateDisplayInfo();

        // Set up periodic updates (every 2 seconds)
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
            this._updateDisplayInfo();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _initDisplayConfig() {
        // DBus interface for org.gnome.Mutter.DisplayConfig
        const DisplayConfigIface = `
        <node>
            <interface name="org.gnome.Mutter.DisplayConfig">
                <method name="GetCurrentState">
                    <arg name="serial" type="u" direction="out"/>
                    <arg name="monitors" type="a((ssss)a(siiddada{sv})a{sv})" direction="out"/>
                    <arg name="logical_monitors" type="a(iiduba(ssss)a{sv})" direction="out"/>
                    <arg name="properties" type="a{sv}" direction="out"/>
                </method>
            </interface>
        </node>`;

        this._displayConfigProxy = Gio.DBusProxy.makeProxyWrapper(DisplayConfigIface);
        try {
            this._proxy = new this._displayConfigProxy(
                Gio.DBus.session,
                'org.gnome.Mutter.DisplayConfig',
                '/org/gnome/Mutter/DisplayConfig'
            );
        } catch (e) {
            log(`VRR Monitor: Failed to create DisplayConfig proxy: ${e}`);
            this._proxy = null;
        }
    }

    _updateDisplayInfo() {
        if (!this._proxy) {
            this._label.set_text(_('-- Hz'));
            return;
        }

        try {
            this._proxy.GetCurrentStateRemote((result, error) => {
                if (error) {
                    log(`VRR Monitor: Error getting display state: ${error}`);
                    this._label.set_text(_('Error'));
                    return;
                }

                if (!result || result.length < 2) {
                    this._label.set_text(_('-- Hz'));
                    return;
                }

                const [serial, monitors, logicalMonitors, properties] = result;

                // Find the primary monitor or first available monitor
                let currentRefreshRate = null;
                let displayName = 'Unknown';
                let vrrSupported = false;

                if (monitors && monitors.length > 0) {
                    // Get info from the first monitor
                    const monitor = monitors[0];
                    if (monitor && monitor.length >= 2) {
                        const [info, modes, props] = monitor;
                        if (info && info.length >= 4) {
                            const [connector, vendor, product, serial] = info;
                            displayName = connector || 'Unknown';
                        }

                        // Find current mode
                        if (modes && modes.length > 0) {
                            for (const mode of modes) {
                                if (mode && mode.length >= 7) {
                                    const [modeId, width, height, refreshRate, preferredScale, supportedScales, modeProps] = mode;
                                    
                                    // Check if this is the current mode
                                    let isCurrent = false;
                                    if (modeProps) {
                                        for (const [key, value] of Object.entries(modeProps)) {
                                            if (key === 'is-current' && value.get_boolean()) {
                                                isCurrent = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (isCurrent) {
                                        currentRefreshRate = refreshRate;
                                        
                                        // Check for VRR support in mode properties
                                        if (modeProps) {
                                            for (const [key, value] of Object.entries(modeProps)) {
                                                if (key === 'vrr' || key === 'variable-refresh-rate') {
                                                    vrrSupported = true;
                                                    break;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }

                        // Check monitor properties for VRR support
                        if (props) {
                            for (const [key, value] of Object.entries(props)) {
                                if (key === 'vrr' || key === 'variable-refresh-rate' || key === 'vrr-capable') {
                                    vrrSupported = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                // Update UI
                if (currentRefreshRate !== null) {
                    const hz = Math.round(currentRefreshRate);
                    this._label.set_text(`${hz} Hz`);
                    this._refreshRateItem.label.set_text(_(`Refresh Rate: ${hz} Hz`));
                } else {
                    this._label.set_text(_('-- Hz'));
                    this._refreshRateItem.label.set_text(_('Refresh Rate: -- Hz'));
                }

                this._displayNameItem.label.set_text(_(`Display: ${displayName}`));
                
                const vrrStatus = vrrSupported ? 'Supported' : 'Not Detected';
                this._vrrStatusItem.label.set_text(_(`VRR Status: ${vrrStatus}`));
            });
        } catch (e) {
            log(`VRR Monitor: Exception updating display info: ${e}`);
            this._label.set_text(_('Error'));
        }
    }

    destroy() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        super.destroy();
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
