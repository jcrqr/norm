# norm

> Generate TypeScript types from a database schema.

## Installation

Using `deno install`:

```bash
$ deno install --allow-net --allow-write https://deno.land/norm@0.1.0/norm.ts
```

## Usage

```bash
$ norm --help
norm 0.1.0
Generate TypeScript types from a database schema.

Examples:
  norm -c mysql://user:password@localhost:3306/public

Supported databases:
  * MySQL

OPTIONS:
    -c, --conn       Database connection string
    -h, --help       Show help information
    -o, --out        Types filename (default: ./types.ts)
    -v, --version    Show version
```

## Documentation

Documentation is available [here](https://doc.deno.land/https/deno.land/x/norm/mod.ts).

## License

This module is licensed under the [MIT License](/LICENSE).
