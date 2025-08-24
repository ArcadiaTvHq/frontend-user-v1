import { defineStore } from "pinia";
import type { User, AuthResponse } from "~/types/auth";
import { AuthService } from "~/api/services/auth.service";
import { LocalStorageService } from "~/src/utils/localStorage";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const isAuthenticated = ref(false);
    const loading = ref(false);

    // Initialize token from localStorage on store creation
    if (process.client) {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        token.value = storedToken;
        // Note: We don't set isAuthenticated here as we need to validate the token
        // The token will be validated on the next API call
      }
    }

    // Getters
    const currentUser = computed(() => user.value);
    const isAdmin = computed(() => user.value?.user_type === "admin");
    const isVerified = computed(() => user.value?.is_verified === true);
    const userFullName = computed(() =>
      user.value ? `${user.value.first_name} ${user.value.last_name}` : ""
    );
    const getToken = computed(() => token.value);

    // Actions
    function setUser(newUser: User | null) {
      user.value = newUser;
      isAuthenticated.value = !!newUser;

      // Set or remove auth cookie based on user state
      if (newUser) {
        useCookie("auth").value = "true";
      } else {
        useCookie("auth").value = null;
      }

      // Clear cache when auth state changes for security and data consistency
      if (process.client) {
        clearContentCache();
      }
    }

    function setToken(newToken: string | null) {
      token.value = newToken;

      // Save token to localStorage for API client access
      if (process.client) {
        if (newToken) {
          localStorage.setItem("auth_token", newToken);
        } else {
          localStorage.removeItem("auth_token");
        }
      }
    }

    async function login(
      email: string,
      password: string
    ): Promise<AuthResponse> {
      loading.value = true;
      try {
        const response = await AuthService.login({ email, password });
        setUser(response.data.user);
        setToken(response.data.token);
        return response;
      } catch (err: any) {
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function register(data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }): Promise<AuthResponse> {
      loading.value = true;
      try {
        const response = await AuthService.register(data);
        setUser(response.data.user);
        setToken(response.data.token);
        return response;
      } catch (err: any) {
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function verifyOTP(otp: string): Promise<AuthResponse> {
      loading.value = true;
      try {
        const response = await AuthService.verifyOTP(otp);
        setUser(response.data.user);
        setToken(response.data.token);
        return response;
      } catch (err: any) {
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function resendOTP(): Promise<AuthResponse> {
      loading.value = true;
      try {
        const response = await AuthService.resendOTP();
        return response;
      } catch (err: any) {
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // Function to clear content cache when auth state changes
    function clearContentCache(): void {
      try {
        console.log("🧹 Clearing content cache due to auth state change...");
        LocalStorageService.clear();
        console.log("✅ Content cache cleared successfully");
      } catch (error) {
        console.error("❌ Failed to clear content cache:", error);
      }
    }

    async function logout(): Promise<void> {
      loading.value = true;
      try {
        // Clear content cache before logout for security
        if (process.client) {
          clearContentCache();
        }

        // await AuthService.logout();
        setUser(null);
        setToken(null);
        // Clear auth cookie
        const authCookie = useCookie("auth");
        authCookie.value = null;
        // Remove token from localStorage
        if (process.client) {
          localStorage.removeItem("auth_token");
        }
        // Navigate to login page
        navigateTo("/login");
      } catch (err: any) {
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // async function refreshUserSession(): Promise<AuthResponse> {
    //   try {
    //     const response = await AuthService.refreshToken();
    //     setUser(response.data.user);
    //     setToken(response.data.token);
    //     return response;
    //   } catch (err) {
    //     setUser(null);
    //     setToken(null);
    //     throw err;
    //   }
    // }

    // function clearError(): void {
    //   error.value = null;
    // }

    return {
      // State
      user,
      token,
      isAuthenticated,
      loading,
      // error,
      // Getters
      currentUser,
      isAdmin,
      isVerified,
      userFullName,
      getToken,
      // Actions
      setUser,
      setToken,
      login,
      register,
      verifyOTP,
      resendOTP,
      logout,
      clearContentCache,
      // refreshUserSession,
      clearError,
    };
  },
  {
    persist: true,
  }
);
