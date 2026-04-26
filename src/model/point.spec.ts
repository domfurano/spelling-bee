import { expect } from 'chai';
import { Point } from './point';

describe('Point', () => {
  describe('constructor', () => {
    it('stores the x coordinate', () => {
      const p = new Point(3, 7);
      expect(p.x).to.equal(3);
    });

    it('stores the y coordinate', () => {
      const p = new Point(3, 7);
      expect(p.y).to.equal(7);
    });

    it('handles negative coordinates', () => {
      const p = new Point(-5, -10);
      expect(p.x).to.equal(-5);
      expect(p.y).to.equal(-10);
    });

    it('handles zero coordinates', () => {
      const p = new Point(0, 0);
      expect(p.x).to.equal(0);
      expect(p.y).to.equal(0);
    });

    it('handles floating-point coordinates', () => {
      const p = new Point(1.5, 2.7);
      expect(p.x).to.be.closeTo(1.5, 0.0001);
      expect(p.y).to.be.closeTo(2.7, 0.0001);
    });
  });

  describe('x and y are read-only', () => {
    it('does not allow x to be set directly', () => {
      const p = new Point(1, 2);
      expect(() => {
        (p as any).x = 99;
      }).to.throw();
    });

    it('does not allow y to be set directly', () => {
      const p = new Point(1, 2);
      expect(() => {
        (p as any).y = 99;
      }).to.throw();
    });
  });

  describe('toString', () => {
    it('returns a formatted string with x and y', () => {
      const p = new Point(3, 7);
      expect(p.toString()).to.equal('{ 3, 7 }');
    });

    it('works with zero values', () => {
      const p = new Point(0, 0);
      expect(p.toString()).to.equal('{ 0, 0 }');
    });

    it('works with negative values', () => {
      const p = new Point(-2, -4);
      expect(p.toString()).to.equal('{ -2, -4 }');
    });

    it('works with floating-point values', () => {
      const p = new Point(1.5, 2.5);
      expect(p.toString()).to.equal('{ 1.5, 2.5 }');
    });
  });
});
