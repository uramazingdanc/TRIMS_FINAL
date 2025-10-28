import { Outlet } from 'react-router-dom';
import { StaffNavigation } from './StaffNavigation';

export function StaffLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <StaffNavigation />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
