import { parseArgs } from "./deps.ts";
import { version } from "./version.ts";
import { norm } from "./mod.ts";

type Args = {
  conn: string;
  help: boolean;
  out: string;
  version: boolean;
};

const help = `norm ${version}
Generate TypeScript types from a database schema.

Examples:
  norm -c mysql://user:password@localhost:3306/public
  norm -c postgres://user:password@localhost:5432/public

Supported databases:
  * MySQL
  * PostgreSQL

OPTIONS:
    -c, --conn       Database connection string
    -h, --help       Show help information
    -o, --out        Types filename (default: ./types.ts)
    -v, --version    Show version
`;

const args = parseArgs(Deno.args, {
  alias: {
    "conn": "c",
    "help": "h",
    "out": "o",
    "version": "v",
  },
  string: [
    "conn",
    "out",
  ],
  boolean: [
    "help",
    "version",
  ],
  default: {
    conn: undefined,
    out: "./types.ts",
  },
}) as unknown as Args;

if (args.help) {
  console.info(help);
  Deno.exit(0);
}

if (args.version) {
  console.info(`norm ${version}`);
  Deno.exit(0);
}

if (!args.conn) {
  console.error("You didn't specified a database connection string.");
  Deno.exit(1);
}

const types = await norm(args.conn);

await Deno.writeTextFile(args.out, types);

console.info(`Types written to ${args.out}`);

Deno.exit(0);
