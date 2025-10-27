import RoomApplicationForm from '@/components/tenant/RoomApplicationForm';
import { TenantNavigation } from '@/components/tenant/TenantNavigation';

const ApplyRoom = () => {
  return (
    <>
      <TenantNavigation />
      <div className="container mx-auto py-6">
        <RoomApplicationForm />
      </div>
    </>
  );
};

export default ApplyRoom;
