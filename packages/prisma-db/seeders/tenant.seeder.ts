import { PrismaSeeder } from "./prisma.seeder";
import { SeedLogger } from "@repo/db-seeder";

type TenantSeedRecord = {
  slug: string;
  name: string;
  allowedOrigins: string[];
  isDefault: boolean;
};

const DEFAULT_TENANTS: TenantSeedRecord[] = [
  {
    slug: "binaryexports",
    name: "Binary Exports",
    allowedOrigins: [
      "binaryexports.com",
      "www.binaryexports.com",
      "https://binaryexports.com",
      "http://binaryexports.com",
      "binaryexports.localhost",
      "http://binaryexports.localhost:3000",
      "https://binaryexports.localhost:3000",
    ],
    isDefault: false,
  },
  {
    slug: "binaryexperiments",
    name: "Binary Experiments",
    allowedOrigins: [
      "binaryexperiments.com",
      "www.binaryexperiments.com",
      "https://binaryexperiments.com",
      "http://binaryexperiments.com",
      "binaryexperiments.localhost",
      "http://binaryexperiments.localhost:3000",
      "https://binaryexperiments.localhost:3000",
    ],
    isDefault: false,
  },
  {
    slug: "binaryexploits",
    name: "Binary Exploits",
    allowedOrigins: [
      "binaryexploits.com",
      "www.binaryexploits.com",
      "https://binaryexploits.com",
      "http://binaryexploits.com",
      "binaryexploits.localhost",
      "http://binaryexploits.localhost:3000",
      "https://binaryexploits.localhost:3000",
    ],
    isDefault: true,
  },
];

export class TenantSeeder extends PrismaSeeder<TenantSeedRecord> {
  readonly entityName = "Tenant";
  readonly seedDataFile = "tenant.json";

  override async loadData(): Promise<void> {
    this.records = [...DEFAULT_TENANTS];
    SeedLogger.log(
      `Loaded ${this.records.length} tenant(s) (inline)`,
      this.entityName,
    );
    SeedLogger.success(
      `✓ Loaded ${this.records.length} record(s)`,
      this.entityName,
    );
  }

  validate(): string[] {
    const errors: string[] = [];
    for (let i = 0; i < this.records.length; i++) {
      const t = this.records[i];
      if (!t.slug?.trim()) errors.push(`Tenant at index ${i}: slug required`);
      if (!t.name?.trim()) errors.push(`Tenant at index ${i}: name required`);
      if (!Array.isArray(t.allowedOrigins))
        errors.push(`Tenant at index ${i}: allowedOrigins must be array`);
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
          allowedOrigins: record.allowedOrigins,
          isDefault: record.isDefault,
        },
        update: {
          name: record.name,
          allowedOrigins: record.allowedOrigins,
          isDefault: record.isDefault,
        },
      });
    }
    SeedLogger.success(
      `✓ Seeded ${this.records.length} tenant(s)`,
      this.entityName,
    );
  }
}
