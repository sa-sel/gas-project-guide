import { BaseProject, SaDepartment, Student } from '@lib';
import { NamedRange, PCGS } from '@project-control/utils/constants';
import { getAllMembers, getNamedValue } from '@project-control/utils/functions';

export class Project extends BaseProject {
  /** Create project by reading data from the spreadsheet. */
  static spreadsheetFactory(): Project {
    return new this(
      getNamedValue(NamedRange.ProjectName).trim(),
      getNamedValue(NamedRange.ProjectDepartment).trim().replace('Diretoria de', '') as SaDepartment,
    )
      .setEdition(getNamedValue(NamedRange.ProjectEdition))
      .setManager(Student.fromNameNicknameString(getNamedValue(NamedRange.ProjectManager), { nUsp: '' }))
      .setDirector(Student.fromNameNicknameString(getNamedValue(NamedRange.ProjectDirector), { nUsp: '' }))
      .setMembers(getAllMembers())
      .setFolder(DriveApp.getFileById(PCGS.ss.getId()).getParents().next());
  }
}
