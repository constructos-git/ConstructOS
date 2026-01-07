import { PublicWorkOrderView } from './components/PublicWorkOrderView';
import { PublicPurchaseOrderView } from './components/PublicPurchaseOrderView';
import { PublicQuoteView } from './components/PublicQuoteView';
import { ClientPortalPage } from './packs/ClientPortalPage';
import { PublicVariationView } from './variations/PublicVariationView';

export const estimatingSharedRoutes = [
  { path: '/shared/work-order/:token', element: <PublicWorkOrderView /> },
  { path: '/shared/purchase-order/:token', element: <PublicPurchaseOrderView /> },
  { path: '/shared/quote/:token', element: <PublicQuoteView /> },
  { path: '/shared/client-pack/:token', element: <ClientPortalPage /> },
  { path: '/shared/variation/:token', element: <PublicVariationView /> },
];

