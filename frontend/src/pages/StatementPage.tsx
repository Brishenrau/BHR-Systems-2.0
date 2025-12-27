import { useState, useEffect } from 'react';
import { statementService } from '../services/statement.service';
import { useSidebarStore } from '../store/sidebarStore';
import type { ApiError } from '../types/api.types';
import type { StatementResponse, TKN_STATEMENT } from '../types/database.types';

type TabType = 'statement' | 'bill';

export const StatementPage = () => {
  const { setCollapsed } = useSidebarStore();
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [searchType, setSearchType] = useState<'account' | 'address' | 'name'>('account');
  const [activeTab, setActiveTab] = useState<TabType>('statement');
  const [data, setData] = useState<StatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);

  // Collapse sidebar when component mounts, restore when unmounts
  useEffect(() => {
    setCollapsed(true);
    return () => {
      setCollapsed(false);
    };
  }, [setCollapsed]);

  // Format date with time for display (dd/mm/yyyy hh24:mi format)
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Format number with 2 decimal places
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };

  // Calculate running balance (statements are already in chronological order from backend)
  const calculateBalances = (statements: TKN_STATEMENT[]): Map<number, number> => {
    const balances = new Map<number, number>();
    let runningBalance = 0;

    statements.forEach((stmt, index) => {
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
    try {
      setLoading(true);
      setError(null);
      
      let nomBakaun: number;

      if (searchType === 'account') {
        if (!accountNumber || accountNumber.trim() === '') {
          setError('Please enter an account number');
          return;
        }
        nomBakaun = parseInt(accountNumber.trim(), 10);
        if (isNaN(nomBakaun)) {
          setError('Invalid account number');
          return;
        }
      } else if (searchType === 'address') {
        if (!address || address.trim() === '') {
          setError('Please enter an address');
          return;
        }
        const accountNumbers = await statementService.searchAccounts({ address: address.trim() });
        if (accountNumbers.length === 0) {
          setError('No accounts found with the given address');
          return;
        }
        if (accountNumbers.length > 1) {
          setError(`Multiple accounts found (${accountNumbers.length}). Please use account number search.`);
          return;
        }
        nomBakaun = accountNumbers[0];
      } else { // name
        if (!ownerName || ownerName.trim() === '') {
          setError('Please enter owner name');
          return;
        }
        const accountNumbers = await statementService.searchAccounts({ ownerName: ownerName.trim() });
        if (accountNumbers.length === 0) {
          setError('No accounts found with the given owner name');
          return;
        }
        if (accountNumbers.length > 1) {
          setError(`Multiple accounts found (${accountNumbers.length}). Please use account number search.`);
          return;
        }
        nomBakaun = accountNumbers[0];
      }

      const [result, propertyInfo] = await Promise.all([
        statementService.getStatementByAccount(nomBakaun),
        statementService.getPropertyDetails(nomBakaun).catch(() => null), // Fetch property details, ignore errors
      ]);
      setData(result);
      setPropertyDetails(propertyInfo);
      // Update account number field with the found account
      setAccountNumber(nomBakaun.toString());
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
  // Statements are already in chronological order from backend, no need to sort
  const sortedStatements = data ? data.statements : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">PENYATA HUTANG TAKSIRAN</h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="account"
                  checked={searchType === 'account'}
                  onChange={(e) => setSearchType(e.target.value as 'account')}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">NOMBOR AKAUN</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="address"
                  checked={searchType === 'address'}
                  onChange={(e) => setSearchType(e.target.value as 'address')}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">ALAMAT</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="name"
                  checked={searchType === 'name'}
                  onChange={(e) => setSearchType(e.target.value as 'name')}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">NAMA PEMILIK</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              {searchType === 'account' && (
                <>
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
                </>
              )}
              {searchType === 'address' && (
                <>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    ALAMAT (Address) - Wildcard search
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address (e.g., LOBAK)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </>
              )}
              {searchType === 'name' && (
                <>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                    NAMA PEMILIK (Owner Name) - Wildcard search
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Enter owner name (e.g., JAYAGANDAN)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </>
              )}
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

        {/* Property and Owner Details */}
        {data && propertyDetails && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">NOMBOR AKAUN</label>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {propertyDetails.accountNumber || accountNumber}
                </p>
              </div>
              {propertyDetails.laneCode && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">KOD LORONG</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{propertyDetails.laneCode}</p>
                </div>
              )}
              {propertyDetails.roadCode && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">KOD JALAN</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{propertyDetails.roadCode}</p>
                </div>
              )}
              {propertyDetails.ownerName && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-semibold text-gray-600 uppercase">NAMA PEMILIK</label>
                  <p className="text-sm font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1 inline-block">
                    {propertyDetails.ownerName}
                  </p>
                </div>
              )}
              {propertyDetails.propertyAddress && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-semibold text-gray-600 uppercase">ALAMAT HARTA</label>
                  <p className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1 inline-block">
                    {propertyDetails.propertyAddress}
                  </p>
                </div>
              )}
              {propertyDetails.mailingAddress && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-semibold text-gray-600 uppercase">ALAMAT SURAT-MENYURAT</label>
                  <p className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1 inline-block">
                    {propertyDetails.mailingAddress}
                  </p>
                </div>
              )}
              {propertyDetails.ownerType && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">JENIS PEMILIK</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{propertyDetails.ownerType}</p>
                </div>
              )}
              {propertyDetails.race && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">BANGSA</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{propertyDetails.race}</p>
                </div>
              )}
              {propertyDetails.ctaCalculation && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">KIRAAN CTA</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{propertyDetails.ctaCalculation}</p>
                </div>
              )}
            </div>
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
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TARIKH KUTIPAN
                    </th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TARIKH KEMASKINI
                    </th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      JENIS
                    </th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      NO RESIT/BIL/LLN
                    </th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      NO KELOMPOK/DOK
                    </th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KOD TRANSAKSI
                    </th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KETERANGAN TRANSAKSI
                    </th>
                    <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      D/K
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      DEBIT
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KREDIT
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider">
                      BAKI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStatements.map((stmt, index) => {
                    const balance = balances.get(index) || 0;
                    const isNegative = balance < 0;
                    
                    return (
                      <tr key={`${stmt.STA_NOMBAKAUN}-${stmt.STA_NOMSERIAL}`} className="hover:bg-gray-50">
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                          {formatDate(stmt.STA_TARIKHTRX)}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                          {formatDate(stmt.STA_TARIKHPOS)}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSTYPE}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                          {stmt.STA_REFERENCE}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                          {stmt.STA_NDOCUMENT || '-'}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSCODE}
                        </td>
                        <td className="px-2 py-1.5 text-xs text-gray-900 border-r border-gray-200">
                          {stmt.TRA_TRANSNAME || stmt.STA_TRANSCODE}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-center text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSDRCR}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-right text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSDRCR === 'D' ? formatCurrency(stmt.STA_AMOUNTTRX) : '-'}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-right text-gray-900 border-r border-gray-200">
                          {stmt.STA_TRANSDRCR === 'K' ? formatCurrency(stmt.STA_AMOUNTTRX) : '-'}
                        </td>
                        <td className={`px-2 py-1.5 whitespace-nowrap text-xs text-right border-r border-gray-200 ${
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
                    <td colSpan={8} className="px-2 py-1.5 text-right text-xs text-gray-700">
                      JUMLAH
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.totals.totalDebit)}
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.totals.totalCredit)}
                    </td>
                    <td className={`px-2 py-1.5 text-right text-xs border-r border-gray-200 ${
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
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      KOD DAN KETERANGAN TRANSAKSI
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      AMAUN SEMASA
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TGK SEMASA
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      TUNGGAKAN
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      BAYARAN LEBIHAN
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-700 uppercase tracking-wider">
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
                        <td className="px-2 py-1.5 text-xs text-gray-900 border-r border-gray-200">
                          {bak.BAK_TRANSCODE} {bak.TRA_TRANSNAME || ''}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNCURR)}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNTHUN)}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNTNGK)}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-right text-gray-900 border-r border-gray-200">
                          {formatCurrency(bak.BAK_AMAUNLBIH)}
                        </td>
                        <td className={`px-2 py-1.5 whitespace-nowrap text-xs text-right border-r border-gray-200 ${
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
                    <td className="px-2 py-1.5 text-xs text-gray-700">
                      JUMLAH BESAR
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNCURR, 0))}
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNTHUN, 0))}
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNTNGK, 0))}
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs text-gray-900 border-r border-gray-200">
                      {formatCurrency(data.bakhutang.reduce((sum, bak) => sum + bak.BAK_AMAUNLBIH, 0))}
                    </td>
                    <td className={`px-2 py-1.5 text-right text-xs border-r border-gray-200 ${
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

