import { ProgressLocation, Range, window } from 'vscode';
import { CaptureSource, LineRange } from './model';
import * as ui from '../ui';
import {showQuickPick, showInputBox} from '../ui';


let captureWasInterrupted = false;

export function shouldResumeCapture(): boolean {
  if (captureWasInterrupted) {
    captureWasInterrupted = false;
    return true;
  }

  return false;
}

export default async function capture(): Promise<any>{
	const { lineRange, content } = await inferContextFromActiveEditor();
  const source: CaptureSource = {
    lineRange,
    content
  };
	// console.log("Linerange: ", lineRange);
	await showQuickPick(source);


  return await ui.showImgCaptionMade(source);
}


async function inferContextFromActiveEditor(): Promise<{
  lineRange?: Range;
	content?: string;
}>{
	const editor = window.activeTextEditor;

	if (!editor) {
    return {};
  }

	const { start, end } = editor.selection;
  const lineRange = new Range(start, end);
  const content = editor.document.getText(editor.selection);
	
	return { lineRange, content };
}
