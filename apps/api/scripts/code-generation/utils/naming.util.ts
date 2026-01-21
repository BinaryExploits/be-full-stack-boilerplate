export class NamingUtil {
  static toKebabCase(str: string): string {
    return str
      .trim()
      .replaceAll(/([a-z])([A-Z])/g, '$1-$2')
      .replaceAll(/[\s_]+/g, '-')
      .toLowerCase();
  }

  static toPascalCase(str: string): string {
    return str
      .trim()
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  static toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
}
