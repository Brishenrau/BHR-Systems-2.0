import { UserRepository } from '../repositories/UserRepository';
import { AccessRepository } from '../repositories/AccessRepository';
import jwt from 'jsonwebtoken';
import type { LoginRequest, LoginResponse, JwtPayload } from '../types/api.types';
import type { BHR_PAYNUMBER } from '../types/database.types';

export class AuthService {
  private userRepository = new UserRepository();
  private accessRepository = new AccessRepository();

  /**
   * Authenticate user and generate JWT token
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { payNumber, password } = credentials;

    // Find active user (includes password field)
    const user = await this.userRepository.findActiveByPayNumber(payNumber);
    if (!user) {
      throw new Error('Invalid pay number or user is inactive');
    }

    // Verify password (plain text comparison for now)
    // TODO: Consider migrating to hashed passwords for better security
    const isValidPassword = user.USE_PASSWORDS === password;
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Get user access modules
    const access = await this.accessRepository.findByPayNumber(payNumber);
    const accessModules = access?.ACC_MODACCESS || 'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT';

    // Generate JWT token
    const payload: JwtPayload = {
      payNumber: user.USE_PAYNUMBER,
      userLevel: user.USE_USERLEVEL || 'U',
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      }
    );

    return {
      token,
      user: this.formatUserResponse(user),
      accessModules,
    };
  }

  /**
   * Verify JWT token and get user
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret-change-in-production'
      ) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(token: string): Promise<BHR_PAYNUMBER> {
    const payload = await this.verifyToken(token);
    const user = await this.userRepository.findByPayNumber(payload.payNumber);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  /**
   * Format user response (NEVER include password!)
   */
  private formatUserResponse(user: BHR_PAYNUMBER): any {
    return {
      USE_PAYNUMBER: user.USE_PAYNUMBER,
      USE_PTJPKCODE: user.USE_PTJPKCODE,
      USE_SHORTNAME: user.USE_SHORTNAME,
      USE_USERLEVEL: user.USE_USERLEVEL,
      USE_STATUSFLG: user.USE_STATUSFLG,
      USE_ENTRYOPER: user.USE_ENTRYOPER,
      USE_ENTRYDATE: user.USE_ENTRYDATE,
      USE_MODFYOPER: user.USE_MODFYOPER,
      USE_MODFYDATE: user.USE_MODFYDATE,
      // NOTE: USE_PASSWORDS is intentionally NOT included for security
    };
  }
}

