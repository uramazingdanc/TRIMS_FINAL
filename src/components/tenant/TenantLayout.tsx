import { Outlet } from 'react-router-dom';
import { TenantNavigation } from './TenantNavigation';

export function TenantLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <TenantNavigation />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
