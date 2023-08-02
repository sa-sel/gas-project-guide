import { PCGS } from './globals.constant';

export const enum SheetName {
  Dashboard = 'Dashboard',
  BoardOfDirectors = 'Diretoria',
  Logs = 'Logs',
  Params = 'Parâmetros',
}

export class projectControlSheets {
  static get logs() {
    return PCGS?.ss.getSheetByName(SheetName.Logs);
  }

  static get dashboard() {
    return PCGS?.ss.getSheetByName(SheetName.Dashboard);
  }

  static get boardOfDirectors() {
    return PCGS?.ss.getSheetByName(SheetName.BoardOfDirectors);
  }

  static get() {
    return PCGS?.ss.getSheetByName(SheetName.Params);
  }
}
