import { Folder, requireNotNull } from '@lib';
import { getNamedValue, NamedRange } from '@project-control';

export const getProjectGuideRepository = (): Folder => {
  try {
    return requireNotNull(DriveApp.getFolderById(getNamedValue(NamedRange.ProjectGuidesRepositoryId)));
  } catch {
    throw Error(
      'Você não tem permissão para abrir o repositório de guias de projetos (ou ele não foi encontrado).' +
        ' Favor entrar em contato com a Diretoria de Tecnologia.',
    );
  }
};
