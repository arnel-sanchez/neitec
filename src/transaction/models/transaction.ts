import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionStatus {
  Pending = 'PENDING',
  Done = 'DONE',
  Rejected = 'REJECTED',
}

@Entity()
export class Transaction {
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
  @Column('double precision')
  'amount': number;

  @ApiProperty({
    description: 'Estado de la transacción',
    enum: TransactionStatus,
    default: TransactionStatus.Pending,
    example: TransactionStatus.Pending,
  })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.Pending,
  })
  'status': TransactionStatus;

  @ApiProperty({
    description: 'Cliente dueño de la transacción',
  })
  @Column()
  'owner': number;

  @ApiProperty({
    description: 'Administrador que aprobó la transacción',
  })
  @Column({ nullable: true })
  'approvedBy': number | null;
}
