export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string | null;
  user_type: "admin" | "user";
  language: string;
  is_verified: boolean;
  user_status: "active" | "inactive";
  location: string | null;
  subscription_id: string | null;
  subscription: any | null; // Replace 'any' with proper subscription interface if needed
}

export interface AuthResponse {
  status: "success" | "error";
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}
