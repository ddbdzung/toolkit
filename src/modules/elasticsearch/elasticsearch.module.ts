// "elasticsearch-v6": "npm:@elastic/elasticsearch@6.8.8",
// pnpm add <alias>@npm:@elastic/elasticsearch@<version>
// pnpm add elasticsearch-v7@npm:@elastic/elasticsearch@7.17.12

export class ElasticsearchException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ElasticsearchException';
  }
}
