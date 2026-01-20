export const NodeEnvironment = {
  Development: 'development',
  Production: 'production',
  Staging: 'staging',
} as const;

export type NodeEnvironment =
  (typeof NodeEnvironment)[keyof typeof NodeEnvironment];

export function parseNodeEnvironment(
  value: string | undefined,
): NodeEnvironment {
  if (Object.values(NodeEnvironment).includes(value as NodeEnvironment)) {
    return value as NodeEnvironment;
  }

  return NodeEnvironment.Development;
}
