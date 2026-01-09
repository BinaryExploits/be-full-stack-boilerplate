export class ServerConstants {
  static readonly TransactionConnectionNames = {
    Mongoose: 'MONGOOSE_CONNECTION',
    Prisma: 'PRISMA_CONNECTION',
  } as const;
}
