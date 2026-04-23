import React from 'react';
import ProfileScreen from '../../../components/ProfileScreen';
import { useCurrentUser, useLogout } from '../../../hooks/useAuth';

export default function StaffProfileTab() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  return <ProfileScreen user={user} onLogout={() => logout.mutate()} loading={logout.isPending} />;
}
