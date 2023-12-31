import { Student, fetchData, getNamedValue } from '@lib';
import { NamedRange, PCGS, projectControlSheets } from '@project-control/utils/constants';

export const getAllMembers = (): Student[] =>
  fetchData(PCGS.ss.getRangeByName(NamedRange.ProjectMembers), {
    map: row =>
      new Student({
        name: row[0],
        nUsp: '',
        nickname: row[1],
        email: row[2],
      }),
  });

export const getBoardOfDirectors = (): Student[] =>
  fetchData(projectControlSheets.boardOfDirectors, {
    map: row =>
      new Student({
        name: row[0],
        nUsp: '',
        nickname: row[1],
        email: row[2],
      }),
  });
