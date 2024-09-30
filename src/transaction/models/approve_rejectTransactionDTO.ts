import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ApproveRejectTransactionDTO {
  @ApiProperty({
    description: 'ID único de la transacción',
    example: 1,
  })
  @IsNotEmpty({ message: 'El id no puede estar vacío' })
  @IsNumber({}, { message: 'El id debe ser un número' })
  'id': number;
}
