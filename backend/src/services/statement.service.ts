import { StatementRepository, BakhutangRepository } from '../repositories/StatementRepository';
import { TransCodeRepository } from '../repositories/TransCodeRepository';
import type { TKN_STATEMENT, TKN_BAKHUTANG } from '../types/database.types';

export interface StatementWithDescription extends TKN_STATEMENT {
  TRA_TRANSNAME?: string | null;
}

export interface BakhutangWithDescription extends TKN_BAKHUTANG {
  TRA_TRANSNAME?: string | null;
}

export interface StatementResponse {
  statements: StatementWithDescription[];
  bakhutang: BakhutangWithDescription[];
  totals: {
    totalDebit: number;
    totalCredit: number;
    totalBalance: number;
  };
}

export class StatementService {
  private statementRepository = new StatementRepository();
  private bakhutangRepository = new BakhutangRepository();
  private transCodeRepository = new TransCodeRepository();

  /**
   * Get statement for an account number with transaction descriptions
   */
  async getStatementByAccount(nomBakaun: number): Promise<StatementResponse> {
    // Fetch statements and debt information
    const [statements, bakhutang] = await Promise.all([
      this.statementRepository.findByAccountNumber(nomBakaun),
      this.bakhutangRepository.findByAccountNumber(nomBakaun),
    ]);

    // Get unique transaction codes
    const transCodes = new Set<string>();
    statements.forEach(s => transCodes.add(s.STA_TRANSCODE));
    bakhutang.forEach(b => transCodes.add(b.BAK_TRANSCODE));

    // Fetch transaction descriptions for all codes
    const transCodeMap = new Map<string, string | null>();
    for (const code of transCodes) {
      const transCode = await this.transCodeRepository.findByCodeAndModuleType(code, 'T');
      transCodeMap.set(code, transCode?.TRA_TRANSNAME || null);
    }

    // Add descriptions to statements
    const statementsWithDesc: StatementWithDescription[] = statements.map(stmt => ({
      ...stmt,
      TRA_TRANSNAME: transCodeMap.get(stmt.STA_TRANSCODE) || null,
    }));

    // Add descriptions to bakhutang
    const bakhutangWithDesc: BakhutangWithDescription[] = bakhutang.map(bak => ({
      ...bak,
      TRA_TRANSNAME: transCodeMap.get(bak.BAK_TRANSCODE) || null,
    }));

    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    statementsWithDesc.forEach(stmt => {
      if (stmt.STA_TRANSDRCR === 'D') {
        totalDebit += stmt.STA_AMOUNTTRX;
      } else {
        totalCredit += stmt.STA_AMOUNTTRX;
      }
    });

    const totalBalance = totalDebit - totalCredit;

    return {
      statements: statementsWithDesc,
      bakhutang: bakhutangWithDesc,
      totals: {
        totalDebit,
        totalCredit,
        totalBalance,
      },
    };
  }

  /**
   * Search for account numbers by address or owner name
   */
  async searchAccounts(searchCriteria: {
    address?: string;
    ownerName?: string;
  }): Promise<number[]> {
    // This will need to be adjusted based on your actual schema
    // Assuming there's a property/pegangan table with address and owner info
    return await this.statementRepository.searchAccountNumbers(searchCriteria);
  }
}

