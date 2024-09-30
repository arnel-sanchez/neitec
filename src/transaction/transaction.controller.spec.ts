import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { ITransactionService } from './transaction.service';
import { CreateTransactionDto } from './models/createTransactionDTO';
import { ApproveRejectTransactionDTO } from './models/approve_rejectTransactionDTO';
import { TransactionStatus } from './models/transaction';
import { UserRole } from '../auth/models/user';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: ITransactionService;

  const mockTransactionService = {
    createTransaction: jest.fn((transactionDto: CreateTransactionDto, userId: string) => {
      return { id: 1, ...transactionDto, userId };
    }),
    approveRejectTransaction: jest.fn((id: string, userId: string, status: TransactionStatus) => {
      return { id, userId, status };
    }),
    getTransactions: jest.fn((userId: string | null) => {
      return [{ id: 1, userId, status: TransactionStatus.Done }];
    }),
  };

  const mockRequest = (role = UserRole.CLIENT, userId = 123) => ({
    user: { role, userId },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: 'ITransactionService',
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<ITransactionService>('ITransactionService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    // Prueba para verificar que se crea una transacción correctamente.
    it('should create a transaction', async () => {
      const transactionDto: CreateTransactionDto = {
          amount: 0
      };
      const req = mockRequest();

      const result = await controller.createTransaction(transactionDto, req);
      expect(transactionService.createTransaction).toHaveBeenCalledWith(transactionDto, req.user.userId);
      expect(result).toEqual({ id: 1, ...transactionDto, userId: req.user.userId });
    });
  });

  describe('approveTransaction', () => {
    // Prueba para verificar que se aprueba una transacción correctamente.
    it('should approve a transaction', async () => {
      const approveDto: ApproveRejectTransactionDTO = { id: 1 };
      const req = mockRequest(UserRole.ADMIN);

      const result = await controller.approveTransaction(approveDto, req);
      expect(transactionService.approveRejectTransaction).toHaveBeenCalledWith(approveDto.id, req.user.userId, TransactionStatus.Done);
      expect(result).toEqual({ id: 1, userId: req.user.userId, status: TransactionStatus.Done });
    });
  });

  describe('rejectTransaction', () => {
    // Prueba para verificar que se cancela una transacción correctamente.
    it('should reject a transaction', async () => {
      const rejectDto: ApproveRejectTransactionDTO = { id: 1 };
      const req = mockRequest(UserRole.ADMIN);

      const result = await controller.rejectTransaction(rejectDto, req);
      expect(transactionService.approveRejectTransaction).toHaveBeenCalledWith(rejectDto.id, req.user.userId, TransactionStatus.Rejected);
      expect(result).toEqual({ id: 1, userId: req.user.userId, status: TransactionStatus.Rejected });
    });
  });

  describe('getTransactions', () => {
    // Prueba para verificar que se obtienen todas las transacciones de un cliente.
    it('should return transactions for non-admin users', async () => {
      const req = mockRequest(UserRole.CLIENT);
      const result = await controller.getTransactions(req, 1, 10);
      expect(transactionService.getTransactions).toHaveBeenCalledWith(req.user.userId, 1, 10);
      expect(result).toEqual([{ id: 1, userId: req.user.userId, status: TransactionStatus.Done }]);
    });

    // Prueba para verificar que se obtienen todas las transacciones del sistema
    it('should return transactions for admin users', async () => {
      const req = mockRequest(UserRole.ADMIN);
      const result = await controller.getTransactions(req, 1, 10);
      expect(transactionService.getTransactions).toHaveBeenCalledWith(null, 1, 10);
      expect(result).toEqual([{ id: 1, userId: null, status: TransactionStatus.Done }]);
    });
  });
});