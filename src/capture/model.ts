import { QuickPickItem, Range } from 'vscode';

export type LineRange = [number, number];

export interface CaptureSource {
  lineRange: Range | undefined;
	content: string | undefined;
}
