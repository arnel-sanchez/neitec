import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, IAuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './models/user';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './models/registerDTO';
import { LoginDto } from './models/loginDTO';
import { AuthDto } from './models/authDTO';
import * as bcrypt from 'bcryptjs';
import { UserDto } from './models/userDTO';

describe('AuthService', () => {
  let authService: IAuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    // Prueba para verificar que un usuario se puede registrar.
    it('should successfully register a new user', async () => {
        const registerDto: RegisterDto = {
          email: 'test@example.com',
          password: 'password',
          name: 'Test User',
          role: UserRole.ADMIN,
        };
      
        const fixedHashedPassword = '$2a$10$9CFxgkR0JpHbHZPJPuFEuuEQOTCWLX9uJUQTJueKW4QB.ePqMA6XK';
        const user = {
          id: 1,
          ...registerDto,
          password: fixedHashedPassword,
        };

        jest.spyOn(bcrypt, 'hash').mockResolvedValue(fixedHashedPassword);
      
        jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
        jest.spyOn(mockUserRepository, 'create').mockReturnValue(user);
        jest.spyOn(mockUserRepository, 'save').mockResolvedValue(user);
        jest.spyOn(mockJwtService, 'sign').mockReturnValue('token');
      
        const result = await authService.registerUser(registerDto);
      
        expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
        expect(mockUserRepository.create).toHaveBeenCalledWith({
          email: registerDto.email,
          password: fixedHashedPassword,
          name: registerDto.name,
          role: registerDto.role,
        });
        expect(result).toEqual(new AuthDto({
          id: user.id,
          email: user.email,
          name: user.name,
          token: 'token',
          role: user.role,
        }));
    });

    // Prueba para verificar que un usuario ya registrado no se pueda volver a registrar.
    it('should throw an error if the email is already registered', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
        role: UserRole.ADMIN,
      };

      const existingUser = { id: 1, ...registerDto };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(existingUser);

      await expect(authService.registerUser(registerDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('loginUser', () => {
    // Prueba para verificar que un usuario puede hacer login.
    it('should successfully log in a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        name: 'Test User',
        role: UserRole.ADMIN,
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(mockJwtService, 'sign').mockReturnValue('token');

      const result = await authService.loginUser(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(result).toEqual(new AuthDto({
        id: user.id,
        email: user.email,
        name: user.name,
        token: 'token',
        role: user.role,
      }));
    });

    // Prueba para verificar que un usuario no puede hacer login cuando sus credenciales son incorrectas.
    it('should throw an error if the credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findByEmail', () => {
    // Prueba para verificar que se obtiene el usuario por su email.
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email, name: 'Test User', role: 'CLIENT' };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      const result = await authService.findByEmail(email);
      expect(result).toEqual(user);
    });

    // Prueba para verificar que cuando el usuario no existe se devuelve nulo.
    it('should return null if the user is not found', async () => {
      const email = 'test@example.com';

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      const result = await authService.findByEmail(email);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    // Prueba para verificar que se obtiene el usuario por su identificador.
    it('should return a user by id', async () => {
      const id = 1;
      const user = { id, email: 'test@example.com', name: 'Test User', role: UserRole.ADMIN };
  
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
  
      const result = await authService.findById(id);
      expect(result).toEqual(new UserDto(user));
    });
  
    // Prueba para verificar que cuando el usuario no existe se devuelve nulo.
    it('should return null if the user is not found', async () => {
      const id = 1;
  
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
  
      const result = await authService.findById(id);
      expect(result).toBeNull();
    });
  });
});