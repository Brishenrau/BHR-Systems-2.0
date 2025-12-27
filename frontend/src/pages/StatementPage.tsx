import { useState } from 'react';
import { statementService } from '../services/statement.service';
import type { ApiError } from '../types/api.types';
import type { StatementResponse, TKN_STATEMENT } from '../types/database.types';

type TabType = 'statement' | 'bill';

export const StatementPage = () => {
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('statement');
  const [data, setData] = useState<StatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date for display
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Format number with 2 decimal places
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };

  // Calculate running balance
  const calculateBalances = (statements: TKN_STATEMENT[]): Map<number, number> => {
    const balances = new Map<number, number>();
    let runningBalance = 0;
    
    // Sort by date and serial (oldest first for proper balance calculation)
    const sorted = [...statements].sort((a, b) => {
      const dateA = new Date(a.STA_TARIKHTRX).getTime();
      const dateB = new Date(b.STA_TARIKHTRX).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.STA_NOMSERIAL - b.STA_NOMSERIAL;
    });

    sorted.forEach((stmt, index) => {
      if (stmt.STA_TRANSDRCR === 'D') {
        runningBalance += stmt.STA_AMOUNTTRX;
      } else {
        runningBalance -= stmt.STA_AMOUNTTRX;
      }
      balances.set(index, runningBalance);
    });

    return balances;
  };

  // Load statement data
  const loadStatement = async () => {
    if (!accountNumber || accountNumber.trim() === '') {
      setError('Please enter an account number');
      return;
    }

    const nomBakaun = parseInt(accountNumber.trim(), 10);
    if (isNaN(nomBakaun)) {
      setError('Invalid account number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await statementService.getStatementByAccount(nomBakaun);
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load statement');
      console.error('Failed to load statement:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStatement();
  };

  const balances = data ? calculateBalances(data.statements) : new Map();
  const sortedStatements = data 
    ? [...data.statements].sort((a, b) => {
        const dateA = new Date(a.STA_TARIKHTRX).getTime();
        const dateB = new Date(b.STA_TARIKHTRX).getTime();
        if (dateA !== dateB) return dateB - dateA; // Newest first
        return b.STA_NOMSERIAL - a.STA_NOMSERIAL;
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">PENYATA HUTANG TAKSIRAN</h1>

        {/* Account Number Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                NOMBOR AKAUN (Account Number)
              </label>
              <input
                type="text"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number (e.g., 35638)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Loading...' : 'Load Statement'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        {data && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('statement')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'statement'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  PENYATA AKAUN
                </button>
                <button
                  onClick={() => setActiveTab('bill')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bill'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  MAKLUMAT BIL
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Account Statement Tab */}
        {data && activeTab === 'statement' && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TARIKH KUTIPAN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TARIKH KEMASKINI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      JENIS
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      NO RESIT/BIL/LLN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      NO KELOMPOK/DOK
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KOD TRANSAKSI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KETERANGAN TRANSAKSI
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      D/K
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      DEBIT
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KREDIT
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      BAKI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStatements.map((stmt, index) => {
                    const sortedIndex = sortedStatements.length - 1 - index; // Reverse index for balance calculation
                    const balance = balances.get(sortedIndex) || 0;
                    const isNegative = balance < 0;
                    
                    return (
                      <tr key={`${stmt.STA_NOMBAKAUN}-${stmt.STA_NOMSERIAL}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {formatDate(stmt.STA_TARIKHTRX)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {formatDate(stmt.STA_TARIKHPOS)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSTYPE}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {stmt.STA_REFERENCE}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {stmt.STA_NDOCUMENT || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSCODE}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {stmt.TRA_TRANSNAME || stmt.STA_TRANSCODE}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSDRCR}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSDRCR === 'D' ? formatCurrency(stmt.STA_AMOUNTTRX) : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSDRCR === 'K' ? formatCurrency(stmt.STA_AMOUNTTRX) : '-'}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right border-r border-gray-200 ${
                          isNegative ? 'text-red-600 font-semibold' : 'text-gray-900'
                        }`}>
                          {isNegative ? `<${formatCurrency(Math.abs(balance))}>` : formatCurrency(balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan={8} className="px-4 py-3 text-right text-sm text-gray-700">
                      JUMLAH
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.totals.totalDebit)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.totals.totalCredit)}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm border-r border-gray-200 ${
                      data.totals.totalBalance < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {data.totals.totalBalance < 0 
                        ? `<${formatCurrency(Math.abs(data.totals.totalBalance))}>`
                        : formatCurrency(data.totals.totalBalance)
                      }
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Bill Information Tab */}
        {data && activeTab === 'bill' && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KOD DAN KETERANGAN TRANSAKSI
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      AMAUN SEMASA
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TGK SEMASA
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TUNGGAKAN
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      BAYARAN LEBIHAN
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      JUMLAH
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.bakhutang.map((bak) => {
                    const total = bak.BAK_AMAUNCURR + bak.BAK_AMAUNTHUN + bak.BAK_AMAUNTNGK - bak.BAK_AMAUNLBIH;
                    const isNegative = total < 0;
                    
                    return (
                      <tr key={`${bak.BAK_NOMBAKAUN}-${bak.BAK_NOMSERIAL}-${bak.BAK_TRANSCODE}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {bak.BAK_TRANSCODE} {bak.TRA_TRANSNAME || ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNCURR)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNTHUN)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNTNGK)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNLBIH)}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right border-r border-gray-200 ${
                          isNegative ? 'text-red-600 font-semibold' : 'text-gray-900'
                        }`}>
                          {isNegative 
                            ? `<${formatCurrency(Math.abs(total))}>`
                            : formatCurrency(total)
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      JUMLAH BESAR
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNCURR, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNTHUN, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNTNGK, 0))}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNLBIH, 0))}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm border-r border-gray-200 ${
                      data.totals.totalBalance < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {data.totals.totalBalance < 0 
                        ? `<${formatCurrency(Math.abs(data.totals.totalBalance))}>`
                        : formatCurrency(data.totals.totalBalance)
                      }
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            Enter an account number and click "Load Statement" to view the statement
          </div>
        )}
      </div>
    </div>
  );
};

