import { PrismaSeeder } from "./prisma.seeder";
import { SeedLogger } from "@repo/db-seeder";

type TenantSeedRecord = {
  slug: string;
  name: string;
  allowedOrigins: string[];
  isDefault?: boolean;
};

export class TenantSeeder extends PrismaSeeder<TenantSeedRecord> {
  readonly entityName = "Tenant";
  readonly seedDataFile = "tenant.json";

  validate(): string[] {
    const errors: string[] = [];
    for (let i = 0; i < this.records.length; i++) {
      const t = this.records[i];
      if (!t.slug?.trim()) errors.push(`Tenant at index ${i}: slug required`);
      if (!t.name?.trim()) errors.push(`Tenant at index ${i}: name required`);
    }
    if (errors.length === 0) {
      SeedLogger.success(
        `✓ Validated ${this.records.length} record(s)`,
        this.entityName,
      );
    }
    return errors;
  }

  async seed(): Promise<void> {
    for (const record of this.records) {
      await this.prisma.tenant.upsert({
        where: { slug: record.slug },
        create: {
          name: record.name,
          slug: record.slug,
          allowedOrigins: record.allowedOrigins ?? [],
          isDefault: record.isDefault ?? false,
        },
        update: {
          name: record.name,
          allowedOrigins: record.allowedOrigins ?? [],
          isDefault: record.isDefault ?? false,
        },
      });
    }
    SeedLogger.success(
      `✓ Seeded ${this.records.length} tenant(s)`,
      this.entityName,
    );
  }
}
