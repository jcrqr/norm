import { PSQLClient, PSQLConnectionOptions } from "../deps.ts";
import { Adapter, ColumnType, Schema } from "../types.ts";

type Options = {
  connOptions: PSQLConnectionOptions;
};

type PSQLColumnType =
  | "int8"
  | "serial8"
  | "bit"
  | "varbit"
  | "bool"
  | "box"
  | "bytea"
  | "char"
  | "varchar"
  | "cidr"
  | "circle"
  | "date"
  | "float8"
  | "inet"
  | "int"
  | "int4"
  | "interval"
  | "json"
  | "jsonb"
  | "line"
  | "lseg"
  | "macaddr"
  | "money"
  | "decimal"
  | "path"
  | "pg_lsn"
  | "point"
  | "polygon"
  | "float4"
  | "int2"
  | "serial2"
  | "serial4"
  | "text"
  | "time"
  | "timetz"
  | "timestamp"
  | "timestamptz"
  | "tsquery"
  | "tsvector"
  | "txid_snapshot"
  | "uuid"
  | "xml";

type PSQLColumnDescription = {
  table: string;
  column: string;
  nullable: "NO" | "YES";
  type: PSQLColumnType;
};

export const adapter: Adapter<PSQLClient, Options> = {
  init(connString) {
    return { connOptions: connOptionsFromConnString(connString) };
  },

  async connect(options) {
    const client = new PSQLClient(options.connOptions);

    await client.connect();

    return client;
  },

  disconnect(client) {
    return client.end();
  },

  async fetchSchema(client) {
    const schema: Schema = { name: "N/A", tables: [] };

    const data = await client.queryObject(`
      SELECT table_name as "table",
        column_name as "column",
        is_nullable as "nullable",
        udt_name    as "type"
      FROM information_schema.columns
      WHERE table_schema = 'public' and table_name NOT LIKE 'pg_%';
    `) as { rows: ReadonlyArray<PSQLColumnDescription> };

    if (!data.rows || data.rows.length === 0) {
      return schema;
    }

    const groupedByTable = data.rows.reduce<
      { [key: string]: ReadonlyArray<PSQLColumnDescription> }
    >(
      (g, info) => ({ ...g, [info.table]: [...(g[info.table] || []), info] }),
      {},
    );

    return {
      ...schema,
      tables: Object.keys(groupedByTable).map((name) => {
        const columns = groupedByTable[name].map((colDesc) => ({
          name: colDesc.column,
          type: mapType(colDesc.type),
        }));

        return { name, columns };
      }),
    };
  },
};

function connOptionsFromConnString(connString: string): PSQLConnectionOptions {
  const { hostname, username, password, pathname, port } = new URL(connString);

  return {
    hostname,
    user: unescape(username),
    password: unescape(password),
    port: parseInt(port),
    database: pathname.slice(1, pathname.length),
  };
}

function mapType(type: PSQLColumnType): ColumnType {
  switch (type) {
    case "int8":
    case "int":
    case "int4":
    case "interval":
    case "serial8":
    case "float4":
    case "int2":
    case "serial2":
    case "serial4":
    case "decimal":
      return "number";

    case "bit":
    case "varbit":
    case "box":
    case "bytea":
    case "char":
    case "varchar":
    case "cidr":
    case "circle":
    case "date":
    case "float8":
    case "inet":
    case "line":
    case "lseg":
    case "macaddr":
    case "money":
    case "tsquery":
    case "tsvector":
    case "txid_snapshot":
    case "uuid":
    case "path":
    case "pg_lsn":
    case "point":
    case "polygon":
    case "text":
      return "string";

    case "bool":
      return "boolean";

    case "time":
    case "timetz":
    case "timestamp":
    case "timestamptz":
      return "Date";

    case "json":
    case "jsonb":
    case "xml":
    default:
      return "unknown";
  }
}
