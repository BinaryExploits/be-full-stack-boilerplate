/**
 * Custom tRPC router generator.
 * Scans Nest tRPC router files in apps/api, extracts procedure definitions (input/output schema names),
 * and emits packages/trpc/src/server/server.ts that imports schemas from @repo/contracts and builds appRouter.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const MONOREPO_ROOT = path.resolve(__dirname, '../../..');
const API_ROUTERS_DIR = path.join(MONOREPO_ROOT, 'apps/api/src');
const OUTPUT_FILE = path.join(__dirname, '../src/server/server.ts');

interface ProcedureDef {
  name: string;
  type: 'query' | 'mutation';
  inputSchema?: string;
  outputSchema?: string;
}

interface RouterDef {
  alias: string;
  procedures: ProcedureDef[];
}

function findRouterFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findRouterFiles(full));
    } else if (e.isFile() && e.name.endsWith('.router.ts')) {
      results.push(full);
    }
  }
  return results;
}

function extractRouterAlias(content: string): string | null {
  const match = content.match(/@Router\s*\(\s*\{\s*alias:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function extractProcedures(content: string): ProcedureDef[] {
  const procedures: ProcedureDef[] = [];
  // Match @Query({ ... }) or @Mutation({ ... }) followed by optional async and method name
  const decoratorRe = /@(Query|Mutation)\s*\(\s*\{([^}]*)\}\s*\)\s*(?:async\s+)?(\w+)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = decoratorRe.exec(content)) !== null) {
    const type = m[1].toLowerCase() as 'query' | 'mutation';
    const objContent = m[2];
    const methodName = m[3];
    let inputSchema: string | undefined;
    let outputSchema: string | undefined;
    const inputMatch = objContent.match(/input:\s*(\w+)/);
    const outputMatch = objContent.match(/output:\s*(\w+)/);
    if (inputMatch) inputSchema = inputMatch[1];
    if (outputMatch) outputSchema = outputMatch[1];
    procedures.push({ name: methodName, type, inputSchema, outputSchema });
  }
  return procedures;
}

function collectRouterDefs(): RouterDef[] {
  const routerFiles = findRouterFiles(API_ROUTERS_DIR);
  const defs: RouterDef[] = [];
  for (const file of routerFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const alias = extractRouterAlias(content);
    if (!alias) continue;
    const procedures = extractProcedures(content);
    defs.push({ alias, procedures });
  }
  // Sort by alias for stable output
  defs.sort((a, b) => a.alias.localeCompare(b.alias));
  return defs;
}

function collectAllSchemaNames(defs: RouterDef[]): Set<string> {
  const names = new Set<string>();
  for (const router of defs) {
    for (const proc of router.procedures) {
      if (proc.inputSchema) names.add(proc.inputSchema);
      if (proc.outputSchema) names.add(proc.outputSchema);
    }
  }
  return names;
}

function generateServerTs(routerDefs: RouterDef[], schemaNames: Set<string>): string {
  const schemaList = Array.from(schemaNames).sort();
  const lines: string[] = [
    `import { initTRPC } from "@trpc/server";`,
    `import {`,
    ...schemaList.map((n) => `  ${n},`),
    `} from "@repo/contracts";`,
    ``,
    `const t = initTRPC.create();`,
    `const publicProcedure = t.procedure;`,
    ``,
    `const PLACEHOLDER = async () => "PLACEHOLDER_DO_NOT_REMOVE" as any;`,
    ``,
    `const appRouter = t.router({`,
  ];

  for (const router of routerDefs) {
    lines.push(`  ${router.alias}: t.router({`);
    for (const proc of router.procedures) {
      let chain = 'publicProcedure';
      if (proc.inputSchema) chain += `.input(${proc.inputSchema})`;
      if (proc.outputSchema) chain += `.output(${proc.outputSchema})`;
      chain += `.${proc.type}(PLACEHOLDER)`;
      lines.push(`    ${proc.name}: ${chain},`);
    }
    lines.push(`  }),`);
  }

  lines.push(`});`);
  lines.push(``);
  lines.push(`export type AppRouter = typeof appRouter;`);
  return lines.join('\n');
}

function main(): void {
  const routerDefs = collectRouterDefs();
  const schemaNames = collectAllSchemaNames(routerDefs);
  const output = generateServerTs(routerDefs, schemaNames);
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(`Generated ${OUTPUT_FILE} with ${routerDefs.length} router(s) and ${schemaNames.size} schema(s).`);
}

main();
