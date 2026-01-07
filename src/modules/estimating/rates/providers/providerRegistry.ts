import { SeededProvider } from './SeededProvider';
import { CsvImportProvider } from './CsvImportProvider';
import type { RateProvider } from './Provider';

export const providerRegistry: Record<string, RateProvider> = {
  seeded: SeededProvider,
  csv_import: CsvImportProvider,
};

