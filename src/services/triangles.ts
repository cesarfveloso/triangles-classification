import { NotATriangleError } from '../models/errors/not-a-triangle-error';
import { Triangle } from '../models/triangle';
import { TrianglesClassificationEnum } from '../models/triangles-classification.enum';
import { HistoryResult, TrianglesRepository } from '../repository/triangles';
import { logger } from './logger';

export class TrianglesService {
  constructor(private triangleRepository: TrianglesRepository) {}
  classification(triangle: Triangle): TrianglesClassificationEnum {
    if (!this.isTriangle(triangle.sides)) {
      throw new NotATriangleError();
    }
    const [sideA, sideB, sideC] = triangle.sides;
    if (this.isEquilateral(sideA, sideB, sideC)) {
      return TrianglesClassificationEnum.EQUILATERAL;
    } else if (this.isScalene(sideA, sideB, sideC)) {
      return TrianglesClassificationEnum.SCALENE;
    } else {
      return TrianglesClassificationEnum.ISOSCELES;
    }
  }

  async getHistory(limit?: number, lastId?: string): Promise<HistoryResult> {
    return this.triangleRepository.getAll(limit, lastId);
  }

  async saveHistory(
    triangle: Triangle,
    user: string,
    type: TrianglesClassificationEnum
  ): Promise<string | undefined> {
    try {
      const { id } = await this.triangleRepository.save({
        id: 'NEW_ID',
        sides: triangle.sides,
        type,
        user,
      });
      logger.info('history saved', id);
      return id;
    } catch (error) {
      logger.error(error);
      return undefined;
    }
  }

  private isTriangle(sides: number[]): boolean {
    if (sides.length !== 3) {
      return false;
    }
    const [sideA, sideB, sideC] = sides;
    return (
      sideA > 0 &&
      sideB > 0 &&
      sideC > 0 &&
      sideA + sideB >= sideC &&
      sideA + sideC >= sideB &&
      sideB + sideC >= sideA
    );
  }

  private isEquilateral(sideA: number, sideB: number, sideC: number): boolean {
    return sideA === sideB && sideB === sideC;
  }

  private isIsosceles(sideA: number, sideB: number, sideC: number): boolean {
    return sideA === sideB || sideA === sideC || sideB === sideC;
  }

  private isScalene(sideA: number, sideB: number, sideC: number): boolean {
    return sideA !== sideB && sideB !== sideC && sideA !== sideC;
  }
}
