import { Injectable } from '@nestjs/common'

@Injectable()
export class MockUserService {
  private readonly MOCK_USER_ID = '0a390afb-d082-47be-9cfa-c3d4eebd553f'

  getCurrentUserId(): string {
    return this.MOCK_USER_ID
  }

  isAuthenticated(): boolean {
    return true
  }

  getUserInfo() {
    return {
      id: this.MOCK_USER_ID,
      email: 'mock@example.com',
      name: 'Mock User',
      isActive: true,
    }
  }
}
