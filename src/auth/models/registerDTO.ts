import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './user';

export class RegisterDto {
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @ApiProperty({
    description: 'Correo electrónico del usuario, debe ser único',
    example: 'juan.perez@example.com',
  })
  @IsString()
  'email': string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @Length(8, 12, {
    message: 'La contraseña debe tener entre 8 y 12 caracteres',
  })
  @ApiProperty({
    description: 'Contraseña del usuario, debe tener entre 8 y 12 caracteres',
    example: 'Probando123*',
  })
  @IsString()
  'password': string;

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
}
