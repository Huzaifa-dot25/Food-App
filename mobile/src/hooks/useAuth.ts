import { useAppDispatch, useAppSelector } from '@/store';
import {
  loginThunk, registerThunk, logoutThunk,
  selectUser, selectIsLoading, selectAuthError,
  selectIsAuthenticated, selectIsCustomer, selectIsOwner,
  selectIsRider, selectIsAdmin, clearError,
} from '@/store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';

export function useAuth() {
  const dispatch = useAppDispatch();

  return {
    user:              useAppSelector(selectUser),
    isLoading:         useAppSelector(selectIsLoading),
    error:             useAppSelector(selectAuthError),
    isAuthenticated:   useAppSelector(selectIsAuthenticated),
    isCustomer:        useAppSelector(selectIsCustomer),
    isOwner:           useAppSelector(selectIsOwner),
    isRider:           useAppSelector(selectIsRider),
    isAdmin:           useAppSelector(selectIsAdmin),
    login:             (data: LoginRequest)    => dispatch(loginThunk(data)),
    register:          (data: RegisterRequest) => dispatch(registerThunk(data)),
    logout:            ()                      => dispatch(logoutThunk()),
    clearError:        ()                      => dispatch(clearError()),
  };
}
