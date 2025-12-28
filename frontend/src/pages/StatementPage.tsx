import { useState, useEffect } from 'react';
import { statementService } from '../services/statement.service';
import { useSidebarStore } from '../store/sidebarStore';
import { generateStatementPDF } from '../utils/generateStatementPDF';
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
  const [matchingAccounts, setMatchingAccounts] = useState<number[]>([]);
  const [accountDetails, setAccountDetails] = useState<Map<number, any>>(new Map());
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

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
          setMatchingAccounts([]);
          return;
        }
        if (accountNumbers.length > 1) {
          // Store matching accounts and fetch their details for display
          setMatchingAccounts(accountNumbers);
          setError(null);
          // Fetch property details for all matching accounts (limit to first 100)
          const detailsMap = new Map<number, any>();
          const accountsToFetch = accountNumbers.slice(0, 100);
          await Promise.all(
            accountsToFetch.map(async (accNum) => {
              try {
                const details = await statementService.getPropertyDetails(accNum);
                if (details) {
                  detailsMap.set(accNum, details);
                }
              } catch (err) {
                console.error(`Failed to fetch details for account ${accNum}:`, err);
              }
            })
          );
          setAccountDetails(detailsMap);
          setData(null);
          setPropertyDetails(null);
          return; // Don't load statement yet, wait for user selection
        }
        nomBakaun = accountNumbers[0];
        setMatchingAccounts([]);
      } else { // name
        if (!ownerName || ownerName.trim() === '') {
          setError('Please enter owner name');
          return;
        }
        const accountNumbers = await statementService.searchAccounts({ ownerName: ownerName.trim() });
        if (accountNumbers.length === 0) {
          setError('No accounts found with the given owner name');
          setMatchingAccounts([]);
          return;
        }
        if (accountNumbers.length > 1) {
          // Store matching accounts and fetch their details for display
          setMatchingAccounts(accountNumbers);
          setError(null);
          // Fetch property details for all matching accounts (limit to first 100)
          const detailsMap = new Map<number, any>();
          const accountsToFetch = accountNumbers.slice(0, 100);
          await Promise.all(
            accountsToFetch.map(async (accNum) => {
              try {
                const details = await statementService.getPropertyDetails(accNum);
                if (details) {
                  detailsMap.set(accNum, details);
                }
              } catch (err) {
                console.error(`Failed to fetch details for account ${accNum}:`, err);
              }
            })
          );
          setAccountDetails(detailsMap);
          setData(null);
          setPropertyDetails(null);
          return; // Don't load statement yet, wait for user selection
        }
        nomBakaun = accountNumbers[0];
        setMatchingAccounts([]);
      }

      const [result, propertyInfo] = await Promise.all([
        statementService.getStatementByAccount(nomBakaun),
        statementService.getPropertyDetails(nomBakaun).catch((err) => {
          console.error('Failed to fetch property details:', err);
          return null; // Return null if property details fail, but don't block statement loading
        }),
      ]);
      setData(result);
      // Only set property details if it's not null and not an empty object
      if (propertyInfo && Object.keys(propertyInfo).length > 0) {
        setPropertyDetails(propertyInfo);
        console.log('Property details received:', propertyInfo); // Debug log
      } else {
        setPropertyDetails(null);
        console.log('No property details received or empty object'); // Debug log
      }
      // Update account number field with the found account
      setAccountNumber(nomBakaun.toString());
      setMatchingAccounts([]); // Clear matching accounts when statement is loaded
      
      // Auto-scroll to bottom after data loads
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
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

  // Handle account selection from the list
  const handleAccountSelect = async (selectedAccountNumber: number) => {
    setAccountNumber(selectedAccountNumber.toString());
    setMatchingAccounts([]);
    setAccountDetails(new Map());
    
    // Load statement for selected account
    try {
      setLoading(true);
      setError(null);
      
      const [result, propertyInfo] = await Promise.all([
        statementService.getStatementByAccount(selectedAccountNumber),
        statementService.getPropertyDetails(selectedAccountNumber).catch((err) => {
          console.error('Failed to fetch property details:', err);
          return null;
        }),
      ]);
      
      setData(result);
      if (propertyInfo && Object.keys(propertyInfo).length > 0) {
        setPropertyDetails(propertyInfo);
      } else {
        setPropertyDetails(null);
      }
      
      // Auto-scroll to bottom after data loads
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load statement');
      console.error('Failed to load statement:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const balances = data ? calculateBalances(data.statements) : new Map();
  // Statements are already in chronological order from backend, no need to sort
  const sortedStatements = data ? data.statements : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

        {/* Matching Accounts Selection List */}
        {matchingAccounts.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {matchingAccounts.length} {matchingAccounts.length === 1 ? 'account' : 'accounts'} found. Please select one:
              </h3>
              {matchingAccounts.length > 100 && (
                <span className="text-xs text-gray-500">
                  (Showing first 100 results)
                </span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded bg-white">
              <div className="divide-y divide-gray-200">
                {matchingAccounts.slice(0, 100).map((accNum) => {
                  const details = accountDetails.get(accNum);
                  return (
                    <button
                      key={accNum}
                      onClick={() => handleAccountSelect(accNum)}
                      className="w-full text-left p-2 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold text-gray-900 min-w-[80px]">Account: {accNum}</span>
                        {details ? (
                          <>
                            {details.ownerName && (
                              <span className="text-gray-700 min-w-[200px] truncate">
                                <span className="font-medium">Owner:</span> {details.ownerName}
                              </span>
                            )}
                            {details.propertyAddress && (
                              <span className="text-gray-600 flex-1 truncate">
                                <span className="font-medium">Address:</span> {details.propertyAddress.replace(/\n/g, ', ')}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Loading details...</span>
                        )}
                        <div className="ml-auto flex-shrink-0 text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PDF Download and Email Buttons */}
        {data && (
          <div className="mb-4 flex justify-end gap-2">
            <button
              onClick={() => generateStatementPDF(data, propertyDetails)}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Generate and download PDF"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowEmailDialog(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Send PDF via email"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Email Dialog */}
        {showEmailDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Statement via Email</h3>
              
              {emailSuccess ? (
                <div className="mb-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {emailSuccess}
                  </div>
                  <button
                    onClick={() => {
                      setShowEmailDialog(false);
                      setEmailSuccess(null);
                      setEmailAddress('');
                    }}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={sendingEmail}
                    />
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEmailDialog(false);
                        setEmailAddress('');
                        setError(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      disabled={sendingEmail}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!emailAddress || !emailAddress.includes('@')) {
                          setError('Please enter a valid email address');
                          return;
                        }
                        
                        try {
                          setSendingEmail(true);
                          setError(null);
                          const accountNum = propertyDetails?.accountNumber || data.statements[0]?.STA_NOMBAKAUN;
                          if (!accountNum) {
                            throw new Error('Account number not found');
                          }
                          await statementService.sendStatementEmail(accountNum, emailAddress);
                          setEmailSuccess(`Statement PDF has been sent successfully to ${emailAddress}`);
                        } catch (err) {
                          const apiError = err as ApiError;
                          setError(apiError.message || 'Failed to send email');
                        } finally {
                          setSendingEmail(false);
                        }
                      }}
                      disabled={sendingEmail || !emailAddress}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Property and Owner Details - Compact Version */}
        {data && (
          <div className="mb-4 p-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-1 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-gray-600 uppercase block">NOMBOR AKAUN</label>
                <p className="text-xs font-bold text-gray-900">
                  {propertyDetails?.accountNumber || accountNumber || data.statements[0]?.STA_NOMBAKAUN}
                </p>
              </div>
              {propertyDetails?.laneCode && (
                <div>
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">KOD LORONG</label>
                  <p className="text-xs font-medium text-gray-900">{propertyDetails.laneCode}</p>
                </div>
              )}
              {propertyDetails?.roadCode && (
                <div>
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">KOD JALAN</label>
                  <p className="text-xs font-medium text-gray-900">{propertyDetails.roadCode}</p>
                </div>
              )}
              {propertyDetails?.ownerType && (
                <div>
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">JENIS PEMILIK</label>
                  <p className="text-xs font-medium text-gray-900">{propertyDetails.ownerType}</p>
                </div>
              )}
              {propertyDetails?.race && (
                <div>
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">BANGSA</label>
                  <p className="text-xs font-medium text-gray-900">{propertyDetails.race}</p>
                </div>
              )}
              {propertyDetails?.ctaCalculation && (
                <div>
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">KIRAAN CTA</label>
                  <p className="text-xs font-medium text-gray-900">{propertyDetails.ctaCalculation}</p>
                </div>
              )}
              {propertyDetails?.ownerName && (
                <div className="col-span-2 md:col-span-2 lg:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">NAMA PEMILIK</label>
                  <p className="text-xs font-bold text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded whitespace-pre-line">
                    {propertyDetails.ownerName}
                  </p>
                </div>
              )}
              {propertyDetails?.propertyAddress && (
                <div className="col-span-2 md:col-span-2 lg:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">ALAMAT HARTA</label>
                  <p className="text-xs font-medium text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded whitespace-pre-line">
                    {propertyDetails.propertyAddress}
                  </p>
                </div>
              )}
              {propertyDetails?.mailingAddress && propertyDetails.mailingAddress !== propertyDetails?.propertyAddress && (
                <div className="col-span-2 md:col-span-2 lg:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-600 uppercase block">ALAMAT SURAT-MENYURAT</label>
                  <p className="text-xs font-medium text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded whitespace-pre-line">
                    {propertyDetails.mailingAddress}
                  </p>
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
                    
                    // Create a unique key using account number, serial, transaction date, and reference
                    const uniqueKey = `${stmt.STA_NOMBAKAUN}-${stmt.STA_NOMSERIAL}-${stmt.STA_TARIKHTRX}-${stmt.STA_REFERENCE}-${index}`;
                    
                    return (
                      <tr key={uniqueKey} className="hover:bg-gray-50">
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

