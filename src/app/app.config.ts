import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { ApiModule } from '../api-sdk/api.module';
import { Configuration } from '../api-sdk/configuration';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      ApiModule.forRoot(() => new Configuration({ basePath: '/api' })),
    ),
  ],
};
