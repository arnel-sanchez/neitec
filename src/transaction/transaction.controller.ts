import {
  Body,
  Controller,
  Inject,
  UseGuards,
  Request,
  Post,
  Get,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ITransactionService } from '../transaction/transaction.service';
import { CreateTransactionDto } from '../transaction/models/createTransactionDTO';
import { TransactionDto } from '../transaction/models/transatcionDTO';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/models/user';
import { Roles } from '../auth/roles.decorator';
import { ApproveRejectTransactionDTO } from '../transaction/models/approve_rejectTransactionDTO';
import { TransactionStatus } from '../transaction/models/transaction';
import { PaginationDto } from 'src/utils/paginationDTO';

@ApiTags('transaction')
@Controller('transaction')
@ApiBearerAuth('JWT')
export class TransactionController {
  constructor(
    @Inject('ITransactionService')
    private readonly transactionService: ITransactionService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Post('/create')
  @ApiOperation({ summary: 'Crear una transacción' })
  async createTransaction(
    @Body() transaction: CreateTransactionDto,
    @Request() req,
  ): Promise<TransactionDto> {
    const userId = req.user.userId;

    return this.transactionService.createTransaction(transaction, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('/approve')
  @ApiOperation({ summary: 'Aprobar una transacción' })
  async approveTransaction(
    @Body() transaction: ApproveRejectTransactionDTO,
    @Request() req,
  ): Promise<TransactionDto> {
    const userId = req.user.userId;

    return this.transactionService.approveRejectTransaction(
      transaction.id,
      userId,
      TransactionStatus.Done,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('/reject')
  @ApiOperation({ summary: 'Rechazar una transacción' })
  async rejectTransaction(
    @Body() transaction: ApproveRejectTransactionDTO,
    @Request() req,
  ): Promise<TransactionDto> {
    const userId = req.user.userId;

    return this.transactionService.approveRejectTransaction(
      transaction.id,
      userId,
      TransactionStatus.Rejected,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  @ApiOperation({ summary: 'Obtener transacciones paginadas' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de la página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de transacciones por página (por defecto: 10)' })
  async getTransactions(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<PaginationDto<TransactionDto>> {
    const userId = req.user.role === UserRole.ADMIN ? null : req.user.userId;

    const maxLimit = 100;
    const finalLimit = Math.min(limit, maxLimit);
    const finalPage = 
      page < 1
      ? 1
      : page;


    const transactions = await this.transactionService.getTransactions(userId, finalPage, finalLimit);

    return transactions;
  }
}
