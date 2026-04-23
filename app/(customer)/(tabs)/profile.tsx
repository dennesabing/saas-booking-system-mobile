import React from 'react';
import { useCurrentUser, useLogout } from '../../../hooks/useAuth';
import ProfileScreen from '../../../components/ProfileScreen';

export default function CustomerProfileTab() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  return <ProfileScreen user={user} onLogout={() => logout.mutate()} loading={logout.isPending} />;
}
