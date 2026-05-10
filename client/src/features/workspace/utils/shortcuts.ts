// Keyboard shortcut definitions for the workspace
// Each shortcut has a key combo, label, and category for display

export const SHORTCUT_CATEGORIES = ['Navigation', 'Editing', 'Canvas', 'View'] as const;
export type ShortcutCategory = typeof SHORTCUT_CATEGORIES[number];

export interface ShortcutDefinition {
    key: string;        // Display string, e.g. "Ctrl+Z"
    label: string;      // Human-readable action
    category: ShortcutCategory;
}

export const SHORTCUTS: ShortcutDefinition[] = [
    // Navigation
    { key: 'V', label: 'Select mode', category: 'Navigation' },
    { key: 'H', label: 'Pan mode', category: 'Navigation' },
    { key: 'A', label: 'Annotation mode', category: 'Navigation' },
    { key: 'I', label: 'Infrastructure mode', category: 'Navigation' },

    // Editing
    { key: 'Ctrl+Z', label: 'Undo', category: 'Editing' },
    { key: 'Ctrl+Shift+Z', label: 'Redo', category: 'Editing' },
    { key: 'Ctrl+S', label: 'Save', category: 'Editing' },
    { key: 'Delete', label: 'Delete selected', category: 'Editing' },
    { key: 'Ctrl+D', label: 'Duplicate selected', category: 'Editing' },
    { key: 'Ctrl+A', label: 'Select all', category: 'Editing' },

    // Canvas
    { key: 'Ctrl++', label: 'Zoom in', category: 'Canvas' },
    { key: 'Ctrl+-', label: 'Zoom out', category: 'Canvas' },
    { key: 'Ctrl+0', label: 'Fit view', category: 'Canvas' },

    // View
    { key: 'F11', label: 'Toggle fullscreen', category: 'View' },
    { key: '?', label: 'Show shortcuts', category: 'View' },
];

/**
 * Returns shortcuts grouped by category in display order.
 */
export function getShortcutsByCategory(): Record<ShortcutCategory, ShortcutDefinition[]> {
    const grouped = {} as Record<ShortcutCategory, ShortcutDefinition[]>;
    for (const cat of SHORTCUT_CATEGORIES) {
        grouped[cat] = SHORTCUTS.filter(s => s.category === cat);
    }
    return grouped;
}
