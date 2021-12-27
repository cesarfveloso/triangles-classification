import { IsArray, IsNumber } from 'class-validator';

export class Triangle {
  @IsArray({ message: 'Sides must be an array of numbers' })
  @IsNumber(undefined, {
    each: true,
    message: 'Each value of sides must be a number',
  })
  sides: number[];
}
