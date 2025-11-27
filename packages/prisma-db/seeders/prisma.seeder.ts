import * as path from "node:path";
import { BaseSeeder } from "@repo/db-seeder";
import { PrismaClient } from "../generated/prisma";

export abstract class PrismaSeeder<T> extends BaseSeeder<T> {
  protected readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super(path.join(__dirname, "seed-data"));
    this.prisma = prisma;
  }
}
