import {
  alert,
  confirm,
  DialogTitle,
  DiscordEmbed,
  DiscordWebhook,
  exportToPdf,
  File,
  Folder,
  GS,
  institutionalEmails,
  SafeWrapper,
  sendEmail,
  SheetLogger,
  substituteVariablesInString,
  Transaction,
} from '@lib';
import { getBoardOfDirectors, getNamedValue, NamedRange, PCGS, Project, projectControlSheets } from '@project-control';
import { ProjectGuideVariable } from '@utils/constants';
import { getProjectGuideRepository } from '@utils/functions';

// TODO: how to use "@views/" here?
import emailBodyHtml from '../views/save-guide.email.html';

const dialogBody = `
Você tem certeza que deseja continuar com essa ação? Ela é irreversível e vai:
- Exportar esse documento para PDF na pasta do projeto;
- Criar uma cópia do arquivo editável para a pasta com os outros guias de projetos;
- Excluir o arquivo editável da pasta do projeto;
- Enviar uma notificação de que o Guia foi salvo por email e pelo Discord para a Diretoria.
`;

const buildProjectDiscordEmbeds = (
  project: Project,
  projectGuidePdf: File,
  projectGuideDoc: File,
  projectGuideRepository: Folder,
): DiscordEmbed[] => {
  const fields: DiscordEmbed['fields'] = [];

  fields.pushIf(project.director, { name: 'Direção', value: project.director?.toString(), inline: true });
  fields.pushIf(project.manager, { name: 'Gerência', value: project.manager?.toString(), inline: true });

  return [
    {
      title: 'Guia de Projeto (PDF)',
      url: projectGuidePdf.getUrl(),
      fields,
      author: {
        name: project.toString(),
        url: project.folder?.getUrl(),
      },
    },
    {
      title: 'Guia de Projeto (Documento Editável)',
      url: projectGuideDoc.getUrl(),
      author: {
        name: project.name,
        url: project.folder?.getUrl(),
      },
    },
    {
      title: 'Repositório de Guias de Projetos',
      url: projectGuideRepository.getUrl(),
    },
  ];
};

export const doSaveGuide = (logger: SheetLogger, boardEmails: string[]) => {
  logger.log(DialogTitle.InProgress, `Execução iniciada`);

  const project = Project.spreadsheetFactory();
  const guideRepository = getProjectGuideRepository();
  const guideDocFile = DriveApp.getFileById(GS.doc.getId());

  let guidePdf: File;
  let guideEditable: File;

  new Transaction()
    .step({
      forward: () => {
        guideEditable = guideDocFile.makeCopy(guideRepository);
        logger.log(DialogTitle.InProgress, `Documento editável copiado para o repositório de guias de projeto:\n${guideDocFile.getUrl()}`);
      },
      backward: () => guideEditable.setTrashed(true),
    })
    .step({
      forward: () => {
        guidePdf = exportToPdf(guideDocFile).moveTo(guideDocFile.getParents().next());
        logger.log(DialogTitle.InProgress, `PDF exportado para a pasta do projeto:\n${guidePdf.getUrl()}`);
      },
      backward: () => guideEditable.setTrashed(true),
    })
    .run();

  if (boardEmails.length) {
    sendEmail({
      subject: `[SA-SEL] Guia de Projeto - "${project.name}"`,
      target: boardEmails,
      htmlBody: substituteVariablesInString(emailBodyHtml, {
        ...project.templateVariables,
        [ProjectGuideVariable.ProjectGuideEditableDocumentUrl]: guideDocFile.getUrl(),
        [ProjectGuideVariable.ProjectGuidePdfUrl]: guidePdf.getUrl(),
        [ProjectGuideVariable.ProjectGuideRepository]: guideRepository.getUrl(),
      }),
      attachments: [guidePdf],
    });

    logger.log(DialogTitle.InProgress, `Guia enviado por email para a Diretoria (${boardEmails.length} emails).`);
  }

  const webhook = new DiscordWebhook(getNamedValue(NamedRange.WebhookBoardOfDirectors));

  webhook.post({
    embeds: buildProjectDiscordEmbeds(project, guidePdf, guideDocFile, guideRepository),
  });
  if (webhook.url.isUrl()) {
    logger.log(DialogTitle.InProgress, 'Guia enviado no canal Discord da Diretoria.');
  }

  alert({
    title: DialogTitle.Success,
    body: 'Guia de projeto salvo com sucesso, o documento editável na pasta do projeto será excluído.',
  });
  logger.log(DialogTitle.Success, 'Guia de projeto salvo com sucesso, o documento editável na pasta do projeto será excluído.');
  guideDocFile.setTrashed(true);
};

export const saveGuide = () =>
  SafeWrapper.factory(saveGuide.name, {
    loggingSheet: () => projectControlSheets.logs,
    allowedEmails: () => (PCGS.ss ? [...getBoardOfDirectors().map(({ email }) => email), ...institutionalEmails] : null),
  }).wrap((logger, auth) =>
    confirm(
      {
        title: 'Salvar Guia de Projeto',
        body: dialogBody,
      },
      () => doSaveGuide(logger, auth.allowedEmails),
      logger,
    ),
  );
