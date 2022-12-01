import { QuickPickItem } from 'vscode';

export type LineRange = [number, number];

export interface CaptureSource {
  lineRange: LineRange | undefined;
	content: string | undefined;
}

export interface CaptureInput {
  title: string;
  description: string;
}
