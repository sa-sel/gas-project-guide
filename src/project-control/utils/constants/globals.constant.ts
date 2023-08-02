import { GS, requireNotNull, Spreadsheet } from '@lib';

/** The project control spreadsheet namespace. */
export class PCGS {
  private static ssCache: Spreadsheet;

  /** The whole spreadsheet. */
  static get ss(): Spreadsheet {
    if (this.ssCache !== undefined) {
      return this.ssCache;
    }

    const projectNameEdition = GS.doc.getName().replace(/^.+? - (.+)$/, '$1');
    const projectControlName = `Controle de Projeto - ${projectNameEdition}`;

    try {
      const projectDir = DriveApp.getFileById(GS.doc.getId()).getParents().next().getParents().next();
      const projectControlFile = projectDir.getFilesByName(projectControlName).next();

      if (projectControlFile.getMimeType() === MimeType.GOOGLE_SHEETS) {
        this.ssCache = requireNotNull(SpreadsheetApp.openById(projectControlFile.getId()));
      } else {
        throw Error();
      }
    } catch {
      throw Error(
        `Mão foi possível encontrar e abrir a planilha de controle do projeto (arquivo buscado: "${projectControlName}"), portanto esse ` +
          'script está indisponível.\nIMPORTANTE: Entre em contato com a Diretoria de Tecnologia para resolver o problema.',
      );
    }

    return this.ssCache;
  }
}
