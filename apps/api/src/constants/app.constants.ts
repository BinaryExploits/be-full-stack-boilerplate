export class AppConstants {
  static readonly DB_CONNECTIONS = {
    MONGOOSE: 'MONGOOSE_CONNECTION',
    PRISMA: 'PRISMA_CONNECTION',
  } as const;

  static readonly REPOSITORIES = {
    CRUD_MONGOOSE: Symbol('ICrudMongooseRepository'),
    CRUD_PRISMA: Symbol('ICrudPrismaRepository'),
  } as const;
}
