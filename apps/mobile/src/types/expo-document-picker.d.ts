declare module "expo-document-picker" {
  export type DocumentPickerAsset = {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  };

  export type DocumentPickerSuccessResult = {
    canceled: false;
    assets: DocumentPickerAsset[];
  };

  export type DocumentPickerCanceledResult = {
    canceled: true;
    assets: null;
  };

  export type DocumentPickerResult =
    | DocumentPickerSuccessResult
    | DocumentPickerCanceledResult;

  export type DocumentPickerOptions = {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
    multiple?: boolean;
  };

  export function getDocumentAsync(
    options?: DocumentPickerOptions
  ): Promise<DocumentPickerResult>;
}
