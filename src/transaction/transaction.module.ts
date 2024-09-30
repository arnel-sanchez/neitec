import { Module } from '@nestjs/common';
import { TransactionController } from '../transaction/transaction.controller';
import { TransactionService } from '../transaction/transaction.service';
import { AuthService } from '../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transaction/models/transaction';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/models/user';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User]),
    AuthModule,
  ],
  providers: [
    {
      provide: 'ITransactionService',
      useClass: TransactionService,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    TransactionService,
  ],
  controllers: [TransactionController],
})
export class TransactionModule {}
