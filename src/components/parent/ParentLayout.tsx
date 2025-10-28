import { Outlet } from 'react-router-dom';
import { ParentNavigation } from './ParentNavigation';

export function ParentLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ParentNavigation />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
