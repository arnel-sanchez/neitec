import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'ID único del usuario',
    example: 1,
  })
  'id': number;

  @Column()
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  'name': string;

  @Column({ unique: true })
  @ApiProperty({
    description: 'Correo electrónico del usuario, debe ser único',
    example: 'juan.perez@example.com',
  })
  'email': string;

  @Column()
  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Probando123*',
  })
  'password': string;

  @Column()
  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    default: UserRole.CLIENT,
    example: UserRole.CLIENT,
  })
  'role': UserRole;
}
