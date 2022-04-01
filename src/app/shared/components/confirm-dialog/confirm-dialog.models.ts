export class ConfirmDialogData {
  title: string = '';
  content: string = '';
  closeButtonText: string = '取消';
  confirmButtonText: string = '確認';

  constructor(data?: {
    title?: string;
    content?: string;
    closeButtonText?: string;
    confirmButtonText?: string;
  }) {
    if (data) {
      this.title = data.title ?? this.title;
      this.content = data.content ?? this.content;
      this.closeButtonText = data.closeButtonText ?? this.closeButtonText;
      this.confirmButtonText = data.confirmButtonText ?? this.confirmButtonText;
    }
  }
}

export type ConfirmDialogResult = boolean | undefined;
