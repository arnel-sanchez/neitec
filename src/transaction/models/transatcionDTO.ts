import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionStatus } from './transaction';
import { UserDto } from '../../auth/models/userDTO';
import { User } from '../../auth/models/user';

export class TransactionDto {
  @ApiProperty({
    description: 'ID único de la transacción',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  'id': number;

  @ApiProperty({
    description: 'Monto de la transacción',
    example: 1500.5,
  })
  @IsNotEmpty({ message: 'El monto no puede estar vacío' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  'amount': number;

  @ApiProperty({
    description: 'Estado de la transacción',
    enum: TransactionStatus,
    default: TransactionStatus.Pending,
    example: TransactionStatus.Pending,
  })
  @IsEnum(TransactionStatus, {
    message: 'El estado debe ser uno de: PENDING, APPROVED, REJECTED',
  })
  'status': TransactionStatus;

  @ApiProperty({
    description: 'Cliente dueño de la transacción',
  })
  @IsNotEmpty({ message: 'El cliente no puede estar vacío' })
  @OneToOne(() => User, (client) => client.id)
  'owner': UserDto;

  @ApiProperty({
    description: 'Administrador que aprobó la transacción',
  })
  @OneToOne(() => User, (admin) => admin.id)
  'approvedBy': UserDto;

  constructor(partial: {
    id: number;
    amount: number;
    status: TransactionStatus;
    owner: UserDto;
    approvedBy: UserDto;
  }) {
    this.id = partial.id;
    this.amount = partial.amount;
    this.status = partial.status;
    this.owner = partial.owner;
    this.approvedBy = partial.approvedBy;
  }
}
