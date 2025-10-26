import { Outlet } from 'react-router-dom';
import { StaffNavigation } from './StaffNavigation';

export function StaffLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <StaffNavigation />
        <div className="container mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
