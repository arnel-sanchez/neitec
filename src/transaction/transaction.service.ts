import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from '../transaction/models/createTransactionDTO';
import { TransactionDto } from '../transaction/models/transatcionDTO';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../transaction/models/transaction';
import { IAuthService } from '../auth/auth.service';
import { PaginationDto } from '../utils/paginationDTO';

export interface ITransactionService {
  getTransactions(clientId: number | null, page: number, limit: number): Promise<PaginationDto<TransactionDto>>;
  createTransaction(
    transaction: CreateTransactionDto,
    userId: number,
  ): Promise<TransactionDto>;
  approveRejectTransaction(
    transactionId: number,
    userId: number,
    transactionStatus: TransactionStatus,
  ): Promise<TransactionDto>;
}

@Injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Función para crear una transacción
  async createTransaction(
    transactionDto: CreateTransactionDto,
    userId: number,
  ): Promise<TransactionDto> {
    const { amount } = transactionDto;

    const newTransaction = this.transactionRepository.create({
      amount,
      status: TransactionStatus.Pending,
      owner: userId,
    });
    const transaction = await this.transactionRepository.save(newTransaction);

    return new TransactionDto({
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      owner: await this.authService.findById(transaction.owner),
      approvedBy: transaction.approvedBy
        ? await this.authService.findById(transaction.approvedBy)
        : null,
    });
  }

  // Función para aprobar o rechazar una transacción
  async approveRejectTransaction(
    transactionId: number,
    userId: number,
    transactionStatus: TransactionStatus,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (transaction == null) {
      throw new NotFoundException('No existe una transacción con ese ID');
    }

    transaction.status = transactionStatus;
    transaction.approvedBy = userId;

    await this.transactionRepository.update(transactionId, transaction);
    await this.transactionRepository.save(transaction);

    return new TransactionDto({
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      owner: await this.authService.findById(transaction.owner),
      approvedBy: transaction.approvedBy
        ? await this.authService.findById(transaction.approvedBy)
        : null,
    });
  }

  // Función para obtener las transacciones de un usuario o todas las trasacciones según el rol
  async getTransactions(clientId: number | null, page: number, limit: number): Promise<PaginationDto<TransactionDto>> {
    const [transactions, total] =
      clientId == null
        ? await this.transactionRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
          })
        : await this.transactionRepository.findAndCount({
            where: { owner: clientId },
            skip: (page - 1) * limit,
            take: limit,
          });


    const transactionsDto = await Promise.all(
      transactions.map(async (transaction) => {
        const owner = await this.authService.findById(transaction.owner);
        const approvedBy = transaction.approvedBy
          ? await this.authService.findById(transaction.approvedBy)
          : null;

        return new TransactionDto({
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          owner: owner,
          approvedBy: approvedBy,
        });
      }),
    );

    return new PaginationDto(transactionsDto, total, page, limit)
  }
}
