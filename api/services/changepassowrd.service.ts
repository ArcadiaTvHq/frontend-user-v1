import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

interface ChangePasswordData {
  currentPassword: String;
  newPassword: String;
}
interface changPasswordResponse{
  message: String;
}
export class changePassword{
  static async update(data: ChangePasswordData): Promise<changPasswordResponse> {
    return await apiClient.post(ENDPOINTS.USER.CHANGE_PASSWORD, {
      old_password: data.currentPassword,
      new_password: data.newPassword,
    })
  }
}
