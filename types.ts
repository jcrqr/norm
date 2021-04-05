export type Options = {
  camelCase: boolean;
  includeHeader: boolean;
};

export type Adapter<
  C,
  O extends Record<string, unknown> = Record<string, unknown>,
> = {
  init(connString: string): O;

  connect(options: O): Promise<C>;

  fetchSchema(client: C, options: O): Promise<Schema>;

  disconnect(client: C, options: O): Promise<void>;
};

export type Table = {
  name: string;
  columns: ReadonlyArray<Column>;
};

export type Column = {
  name: string;
  type: ColumnType;
  description?: string;
};

export type ColumnType = "string" | "number" | "unknown" | "Date";

export type Schema = {
  name: string;
  tables: ReadonlyArray<Table>;
};
