import { NotATriangleError } from '../models/errors/not-a-triangle-error';
import { TrianglesClassificationEnum } from '../models/triangles-classification.enum';
import { TrianglesRepository } from '../repository/triangles';
import { TrianglesService } from './triangles';

describe('Triangles Service', () => {
  describe('triangle classification', () => {
    test('Given a geometric shape with no sides, it will not be considered a triangle', () => {
      const repository = new TrianglesRepository('') as jest.Mocked<TrianglesRepository>;
      const service = new TrianglesService(repository);
      const fn = () => service.classification({ sides: [] });
      expect(fn).toThrowError(NotATriangleError);
    });
    test('Given a geometric shape with one side, it will not be considered a triangle', () => {
      const repository = new TrianglesRepository('') as jest.Mocked<TrianglesRepository>;
      const service = new TrianglesService(repository);
      const fn = () => service.classification({ sides: [1] });
      expect(fn).toThrowError(NotATriangleError);
    });
    test('Given a geometric shape with two sides, it will not be considered a triangle', () => {
      const repository = new TrianglesRepository('') as jest.Mocked<TrianglesRepository>;
      const service = new TrianglesService(repository);
      const fn = () => service.classification({ sides: [1, 2] });
      expect(fn).toThrowError(NotATriangleError);
    });
    test('Given a geometric shape with more than three sides, it will not be considered a triangle', () => {
      const repository = new TrianglesRepository('') as jest.Mocked<TrianglesRepository>;
      const service = new TrianglesService(repository);
      const fn = () => service.classification({ sides: [1, 2, 3, 4] });
      expect(fn).toThrowError(NotATriangleError);
    });
    test('Given a geometric shape with three equal sides, it will be classified as EQUILATERAL triangle', () => {
      const repository = new TrianglesRepository('') as jest.Mocked<TrianglesRepository>;
      const service = new TrianglesService(repository);
      expect(service.classification({ sides: [1, 1, 1] })).toBe(
        TrianglesClassificationEnum.EQUILATERAL
      );
    });
    test('Given a geometric shape with three different sides, it will be classified as SCALENE triangle', () => {
      const repository = new TrianglesRepository('') as jest.Mocked<TrianglesRepository>;
      const service = new TrianglesService(repository);
      expect(service.classification({ sides: [1, 2, 3] })).toBe(
        TrianglesClassificationEnum.SCALENE
      );
    });
    test('Given a geometric shape with three sides and two of them different, it will be classified as ISOSCELES triangle', () => {
      const repository = new TrianglesRepository('') as jest.Mocked<TrianglesRepository>;
      const service = new TrianglesService(repository);
      expect(service.classification({ sides: [3, 2, 3] })).toBe(
        TrianglesClassificationEnum.ISOSCELES
      );
    });
  });
});
