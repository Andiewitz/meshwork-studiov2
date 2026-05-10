import { describe, it, expect } from 'vitest';
import {
    GRID_SIZE_MIN, GRID_SIZE_MAX, GRID_SIZE_DEFAULT,
    gridSizeSchema, clampGridSize,
    EDGE_TYPES, EDGE_TYPE_LABELS, isValidEdgeType,
    EDGE_STYLES, isValidEdgeStyle,
    BG_VARIANTS, BG_VARIANT_LABELS, isValidBgVariant,
} from '@/features/workspace/utils/canvasSettings';

describe('Canvas Settings', () => {

    // ─── Grid size ─────────────────────────────────────────────────

    describe('gridSizeSchema', () => {
        it('accepts min value', () => {
            expect(gridSizeSchema.safeParse(GRID_SIZE_MIN).success).toBe(true);
        });

        it('accepts max value', () => {
            expect(gridSizeSchema.safeParse(GRID_SIZE_MAX).success).toBe(true);
        });

        it('accepts default value', () => {
            expect(gridSizeSchema.safeParse(GRID_SIZE_DEFAULT).success).toBe(true);
        });

        it('rejects below min', () => {
            expect(gridSizeSchema.safeParse(GRID_SIZE_MIN - 1).success).toBe(false);
        });

        it('rejects above max', () => {
            expect(gridSizeSchema.safeParse(GRID_SIZE_MAX + 1).success).toBe(false);
        });

        it('rejects non-integer', () => {
            expect(gridSizeSchema.safeParse(15.5).success).toBe(false);
        });

        it('rejects non-number', () => {
            expect(gridSizeSchema.safeParse('20').success).toBe(false);
        });
    });

    describe('clampGridSize', () => {
        it('clamps below min to min', () => {
            expect(clampGridSize(5)).toBe(GRID_SIZE_MIN);
        });

        it('clamps above max to max', () => {
            expect(clampGridSize(100)).toBe(GRID_SIZE_MAX);
        });

        it('rounds to nearest integer', () => {
            expect(clampGridSize(15.7)).toBe(16);
        });

        it('passes through valid values unchanged', () => {
            expect(clampGridSize(25)).toBe(25);
        });
    });

    // ─── Edge types ────────────────────────────────────────────────

    describe('EDGE_TYPES', () => {
        it('contains exactly 4 types', () => {
            expect(EDGE_TYPES).toHaveLength(4);
        });

        it('includes step, straight, smoothstep, default', () => {
            expect(EDGE_TYPES).toContain('step');
            expect(EDGE_TYPES).toContain('straight');
            expect(EDGE_TYPES).toContain('smoothstep');
            expect(EDGE_TYPES).toContain('default');
        });

        it('each type has a label', () => {
            for (const t of EDGE_TYPES) {
                expect(EDGE_TYPE_LABELS[t]).toBeDefined();
                expect(EDGE_TYPE_LABELS[t].length).toBeGreaterThan(0);
            }
        });
    });

    describe('isValidEdgeType', () => {
        it('returns true for valid types', () => {
            for (const t of EDGE_TYPES) {
                expect(isValidEdgeType(t)).toBe(true);
            }
        });

        it('returns false for invalid types', () => {
            expect(isValidEdgeType('bezier')).toBe(false);
            expect(isValidEdgeType('')).toBe(false);
            expect(isValidEdgeType('custom')).toBe(false);
        });
    });

    // ─── Edge styles ───────────────────────────────────────────────

    describe('EDGE_STYLES', () => {
        it('contains exactly 3 styles', () => {
            expect(EDGE_STYLES).toHaveLength(3);
        });

        it('includes solid, dashed, dotted', () => {
            expect(EDGE_STYLES).toContain('solid');
            expect(EDGE_STYLES).toContain('dashed');
            expect(EDGE_STYLES).toContain('dotted');
        });
    });

    describe('isValidEdgeStyle', () => {
        it('returns true for valid styles', () => {
            for (const s of EDGE_STYLES) {
                expect(isValidEdgeStyle(s)).toBe(true);
            }
        });

        it('returns false for invalid styles', () => {
            expect(isValidEdgeStyle('wavy')).toBe(false);
            expect(isValidEdgeStyle('')).toBe(false);
        });
    });

    // ─── Background variants ───────────────────────────────────────

    describe('BG_VARIANTS', () => {
        it('contains exactly 3 variants', () => {
            expect(BG_VARIANTS).toHaveLength(3);
        });

        it('includes dots, lines, none', () => {
            expect(BG_VARIANTS).toContain('dots');
            expect(BG_VARIANTS).toContain('lines');
            expect(BG_VARIANTS).toContain('none');
        });

        it('each variant has a label', () => {
            for (const v of BG_VARIANTS) {
                expect(BG_VARIANT_LABELS[v]).toBeDefined();
            }
        });
    });

    describe('isValidBgVariant', () => {
        it('returns true for valid variants', () => {
            for (const v of BG_VARIANTS) {
                expect(isValidBgVariant(v)).toBe(true);
            }
        });

        it('returns false for invalid variants', () => {
            expect(isValidBgVariant('grid')).toBe(false);
            expect(isValidBgVariant('')).toBe(false);
        });
    });
});
