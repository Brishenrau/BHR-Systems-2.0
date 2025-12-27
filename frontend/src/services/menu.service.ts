import apiClient from './api';
import type { MenuItem, ProgramItem } from '../types/database.types';

// API response wrapper type (backend wraps responses)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// All 34 standalone menus (flat list, no grouping)
const allMenus: ProgramItem[] = [
  { programCode: 'BELANJAWAN', moduleCode: 'ACC', programName: 'BELANJAWAN', sequence: 1 },
  { programCode: 'PEMBAYARAN', moduleCode: 'ACC', programName: 'PEMBAYARAN', sequence: 2 },
  { programCode: 'GAJI', moduleCode: 'ACC', programName: 'GAJI', sequence: 3 },
  { programCode: 'PINJAMAN', moduleCode: 'ACC', programName: 'PINJAMAN', sequence: 4 },
  { programCode: 'PELABURAN', moduleCode: 'ACC', programName: 'PELABURAN', sequence: 5 },
  { programCode: 'MOHON_BAYARAN', moduleCode: 'ACC', programName: 'MOHON BAYARAN', sequence: 6 },
  { programCode: 'AHLI_MAJLIS', moduleCode: 'HR', programName: 'AHLI MAJLIS', sequence: 7 },
  { programCode: 'PERSONEL', moduleCode: 'HR', programName: 'PERSONEL', sequence: 8 },
  { programCode: 'TUNTUTAN', moduleCode: 'HR', programName: 'TUNTUTAN', sequence: 9 },
  { programCode: 'STOK', moduleCode: 'AST', programName: 'STOK', sequence: 10 },
  { programCode: 'ASET_INVENTORI', moduleCode: 'AST', programName: 'ASET/INVENTORI', sequence: 11 },
  { programCode: 'PEROLEHAN', moduleCode: 'AST', programName: 'PEROLEHAN', sequence: 12 },
  { programCode: 'PERAKAUNAN', moduleCode: 'ACC', programName: 'PERAKAUNAN', sequence: 13 },
  { programCode: 'PERANCANG', moduleCode: 'PLN', programName: 'PERANCANG', sequence: 14 },
  { programCode: 'BANGUNAN', moduleCode: 'PLN', programName: 'BANGUNAN', sequence: 15 },
  { programCode: 'KEJURUTERAAN', moduleCode: 'PLN', programName: 'KEJURUTERAAN', sequence: 16 },
  { programCode: 'LANSKAP', moduleCode: 'PLN', programName: 'LANSKAP', sequence: 17 },
  { programCode: 'MARRIS', moduleCode: 'OTH', programName: 'MARRIS', sequence: 18 },
  { programCode: 'MPSAS', moduleCode: 'OTH', programName: 'MPSAS', sequence: 19 },
  { programCode: 'TUNGGAKAN', moduleCode: 'ASM', programName: 'TUNGGAKAN', sequence: 20 },
  { programCode: 'PENGURUSAN', moduleCode: 'OTH', programName: 'PENGURUSAN', sequence: 21 },
  { programCode: 'PROJEK', moduleCode: 'PLN', programName: 'PROJEK', sequence: 22 },
  { programCode: 'SISTEM_OSC', moduleCode: 'OTH', programName: 'SISTEM OSC', sequence: 23 },
  { programCode: 'PENILAIAN', moduleCode: 'ASM', programName: 'PENILAIAN', sequence: 24 },
  { programCode: 'AUDIT', moduleCode: 'OTH', programName: 'AUDIT', sequence: 25 },
  { programCode: 'KUTIPAN', moduleCode: 'ASM', programName: 'KUTIPAN', sequence: 26 },
  { programCode: 'TAKSIRAN', moduleCode: 'ASM', programName: 'TAKSIRAN', sequence: 27 },
  { programCode: 'PELESENAN', moduleCode: 'LIC', programName: 'PELESENAN', sequence: 28 },
  { programCode: 'SEWAAN', moduleCode: 'LIC', programName: 'SEWAAN', sequence: 29 },
  { programCode: 'PELBAGAI', moduleCode: 'OTH', programName: 'PELBAGAI', sequence: 30 },
  { programCode: 'KOMPAUN', moduleCode: 'LIC', programName: 'KOMPAUN', sequence: 31 },
  { programCode: 'UTILITI', moduleCode: 'UTL', programName: 'UTILITI', sequence: 32 },
  { programCode: 'KOD_GUNASAMA', moduleCode: 'UTL', programName: 'KOD GUNASAMA', sequence: 33 },
  { programCode: 'PERIBADI', moduleCode: 'UTL', programName: 'PERIBADI', sequence: 34 },
];

export const menuService = {
  // Get menu structure for current user (reads from BHR_MENHEADER & BHR_PGRAMCODE)
  // Backend filters based on user's access modules
  async getUserMenu(): Promise<MenuItem[]> {
    // Call actual API (backend wraps response in { success, data, message })
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu/user-menu');
    return response.data.data;
  },

  // Get all programs (for admin)
  async getAllPrograms(): Promise<ProgramItem[]> {
    const response = await apiClient.get<ApiResponse<ProgramItem[]>>('/menu/programs');
    return response.data.data;
  },
};
