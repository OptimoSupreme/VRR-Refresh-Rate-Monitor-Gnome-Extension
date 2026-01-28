import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const RefreshRateIndicator = GObject.registerClass(
    class RefreshRateIndicator extends St.Bin {
        _init() {
            super._init({
                style_class: 'panel-button',
                reactive: true,
                can_focus: true,
                track_hover: true,
            });

            this._label = new St.Label({
                text: '... Hz',
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'vrr-monitor-label'
            });

            this.set_child(this._label);

            this._lastTime = 0;
            this._frameCount = 0;
            this._accumulatedTime = 0;
            this._frameSignalId = 0;
        }

        enable() {
            // Connect to the 'after-paint' signal on the stage to measure frame times
            // Note: 'after-paint' happens after the composition of a frame. 
            // In newer Clutter versions, we might prefer 'presented' signal if available and reliable,
            // but after-paint is a standard way to hoist a frame counter.
            this._frameSignalId = global.stage.connect('after-paint', this._onAfterPaint.bind(this));
        }

        disable() {
            if (this._frameSignalId) {
                global.stage.disconnect(this._frameSignalId);
                this._frameSignalId = 0;
            }
            this._lastTime = 0;
            this._frameCount = 0;
            this._accumulatedTime = 0;
        }

        _onAfterPaint() {
            // GLib.get_monotonic_time() returns microseconds
            const now = GLib.get_monotonic_time();

            if (this._lastTime === 0) {
                this._lastTime = now;
                return;
            }

            const delta = now - this._lastTime; // microseconds
            this._lastTime = now;

            this._frameCount++;
            this._accumulatedTime += delta;

            // Update every 500ms (500,000 microseconds)
            if (this._accumulatedTime >= 500000) {
                // Calculate FPS: (Frames / Time in seconds)
                // Time in seconds = _accumulatedTime / 1,000,000
                const fps = Math.round(this._frameCount / (this._accumulatedTime / 1000000));
                this._label.set_text(`${fps} Hz`);

                this._frameCount = 0;
                this._accumulatedTime = 0;
            }
        }
    });

export default class VRRMonitorExtension extends Extension {
    enable() {
        this._indicator = new RefreshRateIndicator();
        this._indicator.enable();

        // Add to the status area
        Main.panel.addToStatusArea('vrr-monitor', this._indicator, 1);
    }

    disable() {
        if (this._indicator) {
            this._indicator.disable();
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
