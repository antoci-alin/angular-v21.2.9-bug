export class Configuration {
  basePath?: string;
  constructor(params: { basePath?: string } = {}) {
    this.basePath = params.basePath;
  }
}
