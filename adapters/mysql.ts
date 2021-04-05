import { MySQLClient, MySQLClientConfig } from "../deps.ts";
import { Adapter, ColumnType, Schema } from "../types.ts";

type Options = {
  clientConfig: MySQLClientConfig;
};

type MySQLColumnType =
  | "varchar"
  | "datetime"
  | "int"
  | "tinyint"
  | "json"
  | "text";

type MySQLColumnDescription = {
  table: string;
  column: string;
  nullable: "NO" | "YES";
  type: MySQLColumnType;
  comment: string;
};

export const adapter: Adapter<MySQLClient, Options> = {
  init(connString) {
    return { clientConfig: clientConfigFromConnString(connString) };
  },

  connect(options) {
    return new MySQLClient().connect(options.clientConfig);
  },

  disconnect(client) {
    return client.close();
  },

  async fetchSchema(client, options) {
    const schema: Schema = { name: options.clientConfig.db!, tables: [] };

    const data = await client.execute(`
      SELECT table_name as "table",
             column_name as "column",
             is_nullable as "nullable",
             data_type as "type",
             column_comment as "comment"
      FROM information_schema.columns
      WHERE table_schema = '${schema.name}'
    `) as { rows: ReadonlyArray<MySQLColumnDescription> };

    if (!data.rows || data.rows.length === 0) {
      return schema;
    }

    const groupedByTable = data.rows.reduce<
      { [key: string]: ReadonlyArray<MySQLColumnDescription> }
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

function clientConfigFromConnString(connString: string): MySQLClientConfig {
  const { hostname, username, password, pathname, port } = new URL(connString);

  return {
    hostname,
    username,
    password: unescape(password),
    port: parseInt(port),
    db: pathname.slice(1, pathname.length),
  };
}

function mapType(type: MySQLColumnType): ColumnType {
  switch (type) {
    case "text":
    case "varchar":
      return "string";

    case "datetime":
      return "Date";

    case "int":
    case "tinyint":
      return "number";

    case "json":
    default:
      return "unknown";
  }
}
