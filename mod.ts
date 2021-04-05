import { Adapter, Column, Options, Schema, Table } from "./types.ts";
import { adapter as mysqlAdapter } from "./adapters/mysql.ts";
import { adapter as psqlAdapter } from "./adapters/psql.ts";

export const defaultOptions: Options = {
  camelCase: true,
  includeHeader: true,
};

export async function norm(
  connStr: string,
  options: Options = defaultOptions,
): Promise<string> {
  const adapter = adapterFromConnString(connStr);
  const adapterOptions = adapter.init(connStr);
  const client = await adapter.connect(adapterOptions);
  const schema = await adapter.fetchSchema(client, adapterOptions);

  await adapter.disconnect(client, adapterOptions);

  return transform(schema, options);
}

function adapterFromConnString(connStr: string): Adapter<unknown> {
  const { protocol } = new URL(connStr);

  if (protocol === "mysql:") {
    return mysqlAdapter;
  }

  if (protocol === "postgres:") {
    return psqlAdapter;
  }

  throw new Error(`No adapter for protocol: ${protocol}`);
}

function transform(schema: Schema, options: Options): string {
  return schema.tables.map(transformTable(options)).join("\n\n");
}

function transformTable(options: Options) {
  return (table: Table) => {
    const tblName = pascalCase(table.name);
    const columns = table.columns.map(transformColumn(options)).join("\n");

    return [`export type ${tblName} = {`, columns, "}"].flat().join("\n");
  };
}

function transformColumn(options: Options) {
  return (column: Column) => {
    const colName = options.camelCase ? camelCase(column.name) : column.name;

    return `  ${colName}: ${column.type};`;
  };
}

function camelCase(str: string) {
  return str.split(/[-_]/g).map((w, i) =>
    i === 0 ? w : w.slice(0, 1).toUpperCase() + w.slice(1, w.length)
  ).join("");
}

function pascalCase(str: string) {
  return str.split(/[-_]/g).map((w) =>
    w.slice(0, 1).toUpperCase() + w.slice(1, w.length)
  ).join("");
}
