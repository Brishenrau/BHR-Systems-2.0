// SADM Schema Types - Update these when database changes
// Note: USE_PASSWORDS is intentionally NOT included (never send to frontend)
export interface BHR_PAYNUMBER {
  USE_PAYNUMBER: string;
  USE_PTJPKCODE: string;
  USE_SHORTNAME: string;           // Changed from number to string (VARCHAR2)
  USE_USERLEVEL: string;
  USE_STATUSFLG: string;
  USE_ENTRYOPER: string;
  USE_ENTRYDATE: Date | string;
  USE_MODFYOPER?: string;
  USE_MODFYDATE?: Date | string;
}

export interface BHR_MODULCODE {
  MOD_MODULCODE: string;
  MOD_MODULSIRI: number;
  MOD_MODULNAME: string;  // Fixed: should be string, not number
  MOD_STATUSFLG: string;
  MOD_ENTRYOPER: string;
  MOD_ENTRYDATE: Date | string;
  MOD_MODFYOPER?: string;
  MOD_MODFYDATE?: Date | string;
}

export interface BHR_ACCESSMDL {
  ACC_PAYNUMBER: string;
  ACC_MODACCESS: string; // 60 char permission string
  ACC_STATUSFLG: string;
  ACC_ENTRYOPER: string;
  ACC_ENTRYDATE: Date | string;
  ACC_MODFYOPER?: string;
  ACC_MODFYDATE?: Date | string;
}

export interface BHR_MENHEADER {
  MEN_MENNUMBER: number;
  MEN_MENHEADER: string;
  MEN_ENTRYOPER: string;
  MEN_ENTRYDATE: Date | string;
  MEN_MODFYOPER?: string;
  MEN_MODFYDATE?: Date | string;
}

export interface BHR_PGRAMCODE {
  PGR_PGRAMCODE: string;
  PGR_MODULCODE: string;
  PGR_MENNUMBER: number;
  PGR_PGRAMNAME: string;
  PGR_SEQUENCED: number;
  PGR_ENTRYOPER: string;
  PGR_ENTRYDATE: Date | string;
  PGR_MODFYOPER?: string;
  PGR_MODFYDATE?: Date | string;
}

// Combined types for UI
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

