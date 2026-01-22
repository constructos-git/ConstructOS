import { EstimatesPage } from './pages/EstimatesPage';
import { EstimateBuilderPage } from './pages/EstimateBuilderPage';
import { EstimateDetailPage } from './pages/EstimateDetailPage';
import { EstimatingSettingsPage } from './components/settings/EstimatingSettingsPage';
import { BrandPresetsPage } from './designer/BrandPresetsPage';
import { QuoteDesignerPage } from './designer/QuoteDesignerPage';
import { ClientPacksPage } from './packs/ClientPacksPage';
import { PdfThemesPage } from './components/settings/PdfThemesPage';

export const estimatingRoutes = [
  {
    path: '/estimating',
    element: <EstimateBuilderPage />,
  },
  {
    path: '/estimating/:estimateId',
    element: <EstimateDetailPage />,
  },
  {
    path: '/estimating/settings',
    element: <EstimatingSettingsPage />,
  },
  {
    path: '/estimating/brand',
    element: <BrandPresetsPage />,
  },
  {
    path: '/estimating/designer',
    element: <QuoteDesignerPage />,
  },
  {
    path: '/estimating/packs',
    element: <ClientPacksPage />,
  },
  {
    path: '/estimating/pdf-themes',
    element: <PdfThemesPage />,
  },
];

