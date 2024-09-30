import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService, ITransactionService } from './transaction.service';
import { CreateTransactionDto } from './models/createTransactionDTO';
import { TransactionDto } from './models/transatcionDTO';
import { Transaction, TransactionStatus } from './models/transaction';
import { IAuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../auth/models/user';
import { PaginationDto } from '../utils/paginationDTO';

const mockAuthService: Partial<IAuthService> = {
  findById: jest.fn(),
};

describe('TransactionService', () => {
  let service: ITransactionService;
  let transactionRepository: Repository<Transaction>;

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: 'IAuthService',
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {

    // Prueba para verificar que se crea una nueva transacción correctamente.
    it('should create a new transaction', async () => {
      const transactionDto: CreateTransactionDto = { amount: 100 };
      const userId = 1;

      const mockTransaction = {
        id: 1,
        ...transactionDto,
        status: TransactionStatus.Pending,
        owner: userId,
        approvedBy: null,
      };

      mockTransactionRepository.create.mockReturnValue(mockTransaction);

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      mockAuthService.findById = jest.fn().mockResolvedValue(
      {
        id: userId,
        name: 'Client Name',
        email: 'email@gmail.com',
        role: UserRole.CLIENT
      });

      const result = await service.createTransaction(transactionDto, userId);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        amount: transactionDto.amount,
        status: TransactionStatus.Pending,
        owner: userId,
      });

      expect(mockTransactionRepository.save).toHaveBeenCalledWith(mockTransaction);

      expect(result).toEqual(new TransactionDto({
        id: mockTransaction.id,
        amount: mockTransaction.amount,
        status: mockTransaction.status,
        owner: {
          id: userId,
          name: 'Client Name',
          email: "email@gmail.com",
          role: UserRole.CLIENT
        },
        approvedBy: null,
      }));
    });
  });
  
  describe('approveRejectTransaction', () => {
    // Prueba para verificar que se aprueba/cancela una transacción correctamente.
    it('should approve a transaction', async () => {
      const transactionId = 1;
      const userId = 1;

      const mockTransaction = {
        id: transactionId,
        amount: 100,
        status: TransactionStatus.Pending,
        owner: 2,
        approvedBy: null,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.update.mockResolvedValue(undefined);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.Done,
        approvedBy: userId
      });

      mockAuthService.findById = jest.fn().mockImplementation((id: number) => {
        if (id === 2) { // Si el id es 2, es el cliente (dueño)
          return Promise.resolve({
            id: 2,
            name: 'Client Name',
            email: 'client@gmail.com',
            role: UserRole.CLIENT
          });
        } else if (id === 1) { // Si el id es 1, es el admin que aprueba
          return Promise.resolve({
            id: 1,
            name: 'Admin Name',
            email: 'admin@gmail.com',
            role: UserRole.ADMIN
          });
        }
      });

      const result = await service.approveRejectTransaction(transactionId, userId, TransactionStatus.Done);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({ where: { id: transactionId } });
      expect(mockTransactionRepository.update).toHaveBeenCalledWith(transactionId, {
        status: TransactionStatus.Done,
        approvedBy: userId,
        id: 1,
        amount: 100,
        owner: 2
      });

      expect(result).toEqual(new TransactionDto({
        id: mockTransaction.id,
        amount: mockTransaction.amount,
        status: TransactionStatus.Done,
        owner: {
            id: 2,
            name: 'Client Name',
            email: 'client@gmail.com',
            role: UserRole.CLIENT
        },
        approvedBy: {
            id: 1,
            name: 'Admin Name',
            email: 'admin@gmail.com',
            role: UserRole.ADMIN
        },
      }));
    });

    // Prueba para verificar si una transacción existe.
    it('should throw NotFoundException if transaction does not exist', async () => {
      const transactionId = 999;
      const userId = 1;

      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.approveRejectTransaction(transactionId, userId, TransactionStatus.Done))
        .rejects.toThrow(NotFoundException);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({ where: { id: transactionId } });
    });
  });

  describe('getTransactions', () => {
    // Prueba para verificar que el método 'getTransactions' devuelve correctamente las transacciones de un cliente específico.
    it('should return transactions for a specific client', async () => {
      const clientId = 1;

      const mockTransactions = [
        { id: 1, amount: 100, status: TransactionStatus.Done, owner: clientId, approvedBy: null },
      ];

      mockTransactionRepository.findAndCount.mockResolvedValue([mockTransactions, mockTransactions.length]);

      mockAuthService.findById = jest.fn().mockResolvedValue(
        {
          id: clientId,
          name: 'Client Name',
          email: 'email@gmail.com',
          role: UserRole.CLIENT
        });

      const result = await service.getTransactions(clientId, 1, 10);

      expect(mockTransactionRepository.findAndCount).toHaveBeenCalledWith({
        where: { owner: clientId },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(new PaginationDto<TransactionDto>(
        await Promise.all(mockTransactions.map(async transaction => {
          const owner = await mockAuthService.findById(transaction.owner);
          return new TransactionDto({
            id: transaction.id,
            amount: transaction.amount,
            status: transaction.status,
            owner: owner,
            approvedBy: transaction.approvedBy ? await mockAuthService.findById(transaction.approvedBy) : null,
          });
        })),
        1,
        1,
        10,
      ));
    });
  
    // Prueba para verificar que el método 'getTransactions' devuelve todas las transacciones cuando no se proporciona un ID de cliente.
    it('should return all transactions if clientId is null', async () => {
      const mockTransactions = [
        { id: 1, amount: 100, status: TransactionStatus.Done, owner: 1, approvedBy: null },
      ];

      mockTransactionRepository.findAndCount.mockResolvedValue([mockTransactions, mockTransactions.length]);

      mockAuthService.findById = jest.fn().mockResolvedValue(
        {
          id: 1,
          name: 'Client Name',
          email: 'email@gmail.com',
          role: UserRole.CLIENT
        });

      const result = await service.getTransactions(null, 1, 10);

      expect(mockTransactionRepository.findAndCount).toHaveBeenCalled();

      expect(result).toEqual(new PaginationDto<TransactionDto>(
        await Promise.all(mockTransactions.map(async transaction => {
          const owner = await mockAuthService.findById(transaction.owner);
          return new TransactionDto({
            id: transaction.id,
            amount: transaction.amount,
            status: transaction.status,
            owner: owner,
            approvedBy: transaction.approvedBy ? await mockAuthService.findById(transaction.approvedBy) : null,
          });
        })),
        1,
        1,
        10,
      ));
    });
  });
});