export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}
