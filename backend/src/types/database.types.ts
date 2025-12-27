// SADM Schema Types - Matching Oracle table structure
export interface BHR_PAYNUMBER {
  USE_PAYNUMBER: string;
  USE_PASSWORDS: string;           // Password field (plain text for now)
  USE_PTJPKCODE: string;
  USE_SHORTNAME: string;           // Changed from number to string (VARCHAR2)
  USE_USERLEVEL: string | null;
  USE_STATUSFLG: string | null;
  USE_ENTRYOPER: string;
  USE_ENTRYDATE: Date | string | null;
  USE_MODFYOPER?: string | null;
  USE_MODFYDATE?: Date | string | null;
}

export interface BHR_MODULCODE {
  MOD_MODULCODE: string;
  MOD_MODULSIRI: number;
  MOD_MODULNAME: string;  // Fixed: should be string, not number
  MOD_STATUSFLG: string;
  MOD_ENTRYOPER: string;
  MOD_ENTRYDATE: Date | string;
  MOD_MODFYOPER?: string | null;
  MOD_MODFYDATE?: Date | string | null;
}

export interface BHR_ACCESSMDL {
  ACC_PAYNUMBER: string;
  ACC_MODACCESS: string;
  ACC_STATUSFLG: string;
  ACC_ENTRYOPER: string;
  ACC_ENTRYDATE: Date | string;
  ACC_MODFYOPER?: string | null;
  ACC_MODFYDATE?: Date | string | null;
}

export interface BHR_MENHEADER {
  MEN_MENNUMBER: number;
  MEN_MENHEADER: string;
  MEN_ENTRYOPER: string;
  MEN_ENTRYDATE: Date | string;
  MEN_MODFYOPER?: string | null;
  MEN_MODFYDATE?: Date | string | null;
}

export interface BHR_PGRAMCODE {
  PGR_PGRAMCODE: string;
  PGR_MODULCODE: string;
  PGR_MENNUMBER: number;
  PGR_PGRAMNAME: string;
  PGR_SEQUENCED: number;
  PGR_ENTRYOPER: string;
  PGR_ENTRYDATE: Date | string;
  PGR_MODFYOPER?: string | null;
  PGR_MODFYDATE?: Date | string | null;
}

// Combined types for API responses
export interface MenuItem {
  menuNumber: number;
  menuHeader: string;
  programs: ProgramItem[];
}

export interface ProgramItem {
  programCode: string;
  moduleCode: string;
  programName: string;
  sequence: number;
}

// STKN Schema Types - Taksiran (Assessment) Module
export interface TKN_STATEMENT {
  STA_NOMBAKAUN: number;
  STA_NOMSERIAL: number;
  STA_TARIKHTRX: Date | string;
  STA_TARIKHPOS?: Date | string | null;
  STA_REFERENCE: string;
  STA_TRANSCODE: string;
  STA_TRANSTYPE: string;
  STA_STATTRANS?: string | null;
  STA_TRANSDRCR: string; // 'D' for Debit, 'K' for Credit
  STA_AMOUNTTRX: number;
  STA_CARABAYAR?: string | null;
  STA_NDOCUMENT?: string | null;
  STA_PUSATKTPN?: string | null;
  STA_ENTRYOPER: string;
  STA_ENTRYDATE: Date | string;
}

export interface TKN_BAKHUTANG {
  BAK_NOMBAKAUN: number;
  BAK_NOMSERIAL: number;
  BAK_TRANSCODE: string;
  BAK_AMAUNCURR: number;
  BAK_AMAUNTHUN: number;
  BAK_AMAUNTNGK: number;
  BAK_AMAUNLBIH: number;
  BAK_ENTRYOPER: string;
  BAK_ENTRYDATE: Date | string;
}

// SUTL Schema Types - Common Codes
export interface UTL_TRANSCODE {
  TRA_TRANSCODE: string;
  TRA_MODULTYPE: string;
  TRA_TRANSDESC?: string | null;
  // Add other fields as needed
}

