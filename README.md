# Repro for angular/angular-cli#34665

`export 'ModuleWithProviders' (imported as 'ModuleWithProviders') was not found in '@angular/core'`
after upgrading `@angular-devkit/build-angular` from 21.2.27 to 21.2.29 (webpack `browser` builder).

## Steps

```sh
npm ci
npm run build        # ng build --configuration development
```

Result:

```
./src/api-sdk/api.module.ts:4:0-52 - Error: export 'ModuleWithProviders' (imported as 'ModuleWithProviders')
was not found in '@angular/core' (possible exports: ...)
```

## Required conditions

- `@angular-devkit/build-angular:browser` (webpack) builder, version 21.2.29
- `"emitDecoratorMetadata": true` in `tsconfig.json`
- A decorated class that imports a type-only export as a regular named import, used only in a type
  position. Here: `src/api-sdk/api.module.ts`, the shape `openapi-generator` (typescript-angular) emits.

## Findings

| Setup | Result |
| --- | --- |
| build-angular 21.2.27 (bundles webpack 5.105.2) | ✅ builds |
| build-angular 21.2.29 (bundles webpack 5.112.0) | ❌ error |
| build-angular 21.2.27 + `overrides.webpack` 5.110.1 | ✅ builds |
| build-angular 21.2.27 + `overrides.webpack` 5.110.2 | ❌ error |
| 21.2.29 with `emitDecoratorMetadata` removed | ✅ builds |
| 21.2.29 with `import { type ModuleWithProviders, ... }` | ✅ builds |

The only functional change in build-angular 21.2.27 → 21.2.29 is the webpack bump (5.105.2 → 5.112.0);
the source changes only update `require` paths for webpack's reorganized `lib/dependencies`.

The first failing webpack version is **5.110.2**. Its changelog includes
[webpack/webpack#21856](https://github.com/webpack/webpack/pull/21856): *"Report a named import that is never
read when it names a missing export."*

With `emitDecoratorMetadata: true`, the TypeScript emit through `@ngtools/webpack` keeps the
`import { ModuleWithProviders, NgModule } from '@angular/core'` statement even though `ModuleWithProviders` is
type-only and never read. Older webpack ignored the unread binding. Since 5.110.2, webpack reports it as an error.

## Environment

- Angular 21.2.26, Angular CLI / build-angular 21.2.29
- TypeScript 5.9.3, npm, macOS arm64, Node 24 / 26
