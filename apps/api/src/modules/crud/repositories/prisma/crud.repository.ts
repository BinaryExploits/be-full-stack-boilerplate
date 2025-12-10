import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { CrudRepositoryAbstract } from './crud.repository.abstract';
import { PrismaTransactionAdapter } from '../../../prisma/prisma.module';

@Injectable()
export class CrudRepository extends CrudRepositoryAbstract {
  constructor(prismaTxHost: TransactionHost<PrismaTransactionAdapter>) {
    super(prismaTxHost);
  }
}
