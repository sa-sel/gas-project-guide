import { GS } from '@lib';
import { saveGuide } from './save-guide.feature';

export const onOpen = () => {
  GS.ui.createMenu('[Guia de Projeto]').addItem('Salvar Guia', saveGuide.name).addToUi();
};
