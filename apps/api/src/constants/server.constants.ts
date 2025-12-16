export class ServerConstants {
  static readonly TransactionConnectionNames = {
    Mongoose: 'MONGOOSE_CONNECTION',
    Prisma: 'PRISMA_CONNECTION',
  } as const;

  static readonly Repositories = {
    MongooseCrudInterface: Symbol('ICrudMongooseRepository'),
    PrismaCrudInterface: Symbol('ICrudPrismaRepository'),
  } as const;
}
