import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class VRRMonitorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'Settings',
            description: 'Configure the VRR Monitor'
        });

        // Placeholder for future settings
        const row = new Adw.ActionRow({ title: 'No settings available yet' });
        group.add(row);

        page.add(group);
        window.add(page);
    }
}
