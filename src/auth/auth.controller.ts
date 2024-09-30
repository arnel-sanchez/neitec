import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IAuthService } from './auth.service';
import { RegisterDto } from './models/registerDTO';
import { AuthDto } from './models/authDTO';
import { LoginDto } from './models/loginDTO';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  @ApiOperation({ summary: 'Registro de un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente.',
    type: AuthDto,
  })
  @ApiResponse({
    status: 401,
    description: 'El correo ya está registrado',
  })
  @Post('/register')
  async registerUser(@Body() registerDto: RegisterDto): Promise<AuthDto> {
    return this.authService.registerUser(registerDto);
  }

  @ApiOperation({ summary: 'Iniciar sesión de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado correctamente.',
    type: AuthDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas.',
  })
  @Post('/login')
  async loginUser(@Body() loginDto: LoginDto): Promise<AuthDto> {
    return this.authService.loginUser(loginDto);
  }
}
