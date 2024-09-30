import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { IAuthService } from './auth.service';
import { RegisterDto } from './models/registerDTO';
import { AuthDto } from './models/authDTO';
import { LoginDto } from './models/loginDTO';
import { UserRole } from './models/user';

const mockAuthService = {
  registerUser: jest.fn(),
  loginUser: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: IAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'IAuthService',
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<IAuthService>('IAuthService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    // Prueba para verificar que un usuario se puede registrar.
    it('should register a new user and return an AuthDto', async () => {
      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.ADMIN,
        };

      const expectedAuthDto = new AuthDto({
        id: 1,
        email: registerDto.email,
        token: 'fake-jwt-token',
        role: UserRole.ADMIN,
        name: registerDto.name,
      });

      mockAuthService.registerUser.mockResolvedValue(expectedAuthDto);

      const result = await authController.registerUser(registerDto);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(registerDto);

      expect(result).toEqual(expectedAuthDto);
    });

    // Prueba para verificar que un usuario ya registrado no se pueda volver a registrar.
    it('should handle an error when email is already registered', async () => {
      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.ADMIN,
      };

      mockAuthService.registerUser.mockRejectedValue(new Error('El correo ya está registrado'));

      try {
        await authController.registerUser(registerDto);
      } catch (error) {
        expect(error.message).toBe('El correo ya está registrado');
      }

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('loginUser', () => {
    // Prueba para verificar que un usuario puede hacer login.
    it('should authenticate a user and return an AuthDto', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const expectedAuthDto = new AuthDto({
        id: 1,
        email: loginDto.email,
        token: 'fake-jwt-token',
        role: UserRole.ADMIN,
        name: "Test Name",
      });

      mockAuthService.loginUser.mockResolvedValue(expectedAuthDto);

      const result = await authController.loginUser(loginDto);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(loginDto);

      expect(result).toEqual(expectedAuthDto);
    });

    // Prueba para verificar que un usuario no puede hacer login cuando sus credenciales son incorrectas.
    it('should handle invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      mockAuthService.loginUser.mockRejectedValue(new Error('Credenciales inválidas'));

      try {
        await authController.loginUser(loginDto);
      } catch (error) {
        expect(error.message).toBe('Credenciales inválidas');
      }

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(loginDto);
    });
  });
});