import { expect } from 'chai';
import { InteractionListenerSystem } from './interactionListenerSystem';
import { Point } from '../model/point';

// Access the private static method for testing via type cast
const insidePolygon: (points: Point[], N: number, p: Point) => boolean =
  (InteractionListenerSystem as any).insidePolygon;

describe('InteractionListenerSystem', () => {
  describe('insidePolygon', () => {
    // Helper to build a square polygon centred at (cx, cy) with half-side s
    function makeSquare(cx: number, cy: number, s: number): Point[] {
      return [
        new Point(cx - s, cy - s),
        new Point(cx + s, cy - s),
        new Point(cx + s, cy + s),
        new Point(cx - s, cy + s),
      ];
    }

    // Helper to build a regular hexagon centred at (cx, cy) with radius r
    function makeHexagon(cx: number, cy: number, r: number): Point[] {
      const pts: Point[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        pts.push(new Point(cx + r * Math.cos(angle), cy + r * Math.sin(angle)));
      }
      return pts;
    }

    describe('square polygon', () => {
      const square = makeSquare(0, 0, 10);

      it('returns true for a point at the centre', () => {
        expect(insidePolygon(square, 4, new Point(0, 0))).to.be.true;
      });

      it('returns true for a point near a corner (inside)', () => {
        expect(insidePolygon(square, 4, new Point(5, 5))).to.be.true;
      });

      it('returns false for a point clearly outside', () => {
        expect(insidePolygon(square, 4, new Point(20, 20))).to.be.false;
      });

      it('returns false for a point to the right of the polygon', () => {
        expect(insidePolygon(square, 4, new Point(15, 0))).to.be.false;
      });

      it('returns false for a point below the polygon', () => {
        expect(insidePolygon(square, 4, new Point(0, 15))).to.be.false;
      });

      it('returns false for a point to the left of the polygon', () => {
        expect(insidePolygon(square, 4, new Point(-15, 0))).to.be.false;
      });

      it('returns false for a point above the polygon', () => {
        expect(insidePolygon(square, 4, new Point(0, -15))).to.be.false;
      });
    });

    describe('hexagon polygon', () => {
      const hexagon = makeHexagon(150, 160, 55);

      it('returns true for a point at the centre of the hexagon', () => {
        expect(insidePolygon(hexagon, 6, new Point(150, 160))).to.be.true;
      });

      it('returns true for a point well inside the hexagon', () => {
        expect(insidePolygon(hexagon, 6, new Point(150, 170))).to.be.true;
      });

      it('returns false for a point far outside the hexagon', () => {
        expect(insidePolygon(hexagon, 6, new Point(300, 300))).to.be.false;
      });

      it('returns false for a point just outside the hexagon boundary', () => {
        // The rightmost vertex is at x = 150 + 55 = 205; a point at x = 210 is beyond it
        expect(insidePolygon(hexagon, 6, new Point(150 + 60, 160))).to.be.false;
      });
    });
  });
});
