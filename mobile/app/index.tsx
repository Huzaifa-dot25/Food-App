import { Redirect } from 'expo-router';
import { useAppSelector } from '@/store';
import { selectIsAuthenticated, selectIsInitialized, selectIsCustomer, selectIsOwner, selectIsRider, selectIsAdmin } from '@/store/slices/authSlice';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * Root index — redirects to the correct dashboard based on auth state and role.
 */
export default function Index() {
  const isInitialized   = useAppSelector(selectIsInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isCustomer      = useAppSelector(selectIsCustomer);
  const isOwner         = useAppSelector(selectIsOwner);
  const isRider         = useAppSelector(selectIsRider);
  const isAdmin         = useAppSelector(selectIsAdmin);

  if (!isInitialized) return <LoadingSpinner fullScreen message="Loading..." />;

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  if (isAdmin)    return <Redirect href="/(admin)/dashboard" />;
  if (isOwner)    return <Redirect href="/(owner)/dashboard" />;
  if (isRider)    return <Redirect href="/(rider)/dashboard" />;
  if (isCustomer) return <Redirect href="/(customer)/(tabs)/home" />;

  return <Redirect href="/(auth)/welcome" />;
}
