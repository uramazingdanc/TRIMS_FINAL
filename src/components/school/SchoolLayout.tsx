import { Outlet } from 'react-router-dom';
import { SchoolNavigation } from './SchoolNavigation';

export function SchoolLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <SchoolNavigation />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
