import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './user';

export class AuthDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 1,
  })
  'id': number;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
  })
  @IsString()
  'email': string;

  @ApiProperty({ description: 'Token de acceso del usuario' })
  @IsNotEmpty({ message: 'El token de acceso es obligatorio' })
  'token': string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  'name': string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    default: UserRole.CLIENT,
    example: UserRole.CLIENT,
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(UserRole, { message: 'El rol debe ser uno de: CLIENT, ADMIN' })
  'role': UserRole;

  constructor(partial: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    token: string;
  }) {
    this.id = partial.id;
    this.email = partial.email;
    this.name = partial.name;
    this.role = partial.role;
    this.token = partial.token;
  }
}
