// std
export { parse as parseArgs } from "https://deno.land/std@0.91.0/flags/mod.ts";

// x/mysql
export { Client as MySQLClient } from "https://deno.land/x/mysql/mod.ts";
export type { ClientConfig as MySQLClientConfig } from "https://deno.land/x/mysql/mod.ts";

// x/postgres
export { Client as PSQLClient } from "https://deno.land/x/postgres@v0.9.0/mod.ts";
export type { ConnectionOptions as PSQLConnectionOptions } from "https://deno.land/x/postgres@v0.9.0/connection/connection_params.ts";
