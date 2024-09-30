import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './models/registerDTO';
import { LoginDto } from './models/loginDTO';
import { AuthDto } from './models/authDTO';
import { Repository } from 'typeorm';
import { User, UserRole } from './models/user';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './models/userDTO';

export interface IAuthService {
  registerUser(user: RegisterDto): Promise<AuthDto>;
  loginUser(login: LoginDto): Promise<AuthDto>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<UserDto | null>;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Función para registrar un usuario
  async registerUser(registerDto: RegisterDto): Promise<AuthDto> {
    const { email, password, name, role } = registerDto;
    const existingUser = await this.findByEmail(email);

    if (existingUser != null) {
      throw new UnauthorizedException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });
    const user = await this.userRepository.save(newUser);

    return new AuthDto({
      id: user.id,
      email: user.email,
      name: user.name,
      token: this.createToken(user.id, user.email, user.role),
      role: user.role,
    });
  }

  // Función para iniciar sesión
  async loginUser(login: LoginDto): Promise<AuthDto> {
    const { email, password } = login;
    const user = await this.findByEmail(email);

    if (user == null || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return new AuthDto({
      id: user.id,
      email: user.email,
      name: user.name,
      token: this.createToken(user.id, user.email, user.role),
      role: user.role,
    });
  }

  // Función para buscar un usuario por su correo electrónico
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // Función para buscar un usuario por su ID
  async findById(id: number): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return null;
    }

    return new UserDto({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }

  // Función para crear token JWT
  private createToken(userId: number, email: string, role: UserRole): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
