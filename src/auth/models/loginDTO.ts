import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  @ApiProperty({
    description: 'Correo electrónico del usuario',
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
}
