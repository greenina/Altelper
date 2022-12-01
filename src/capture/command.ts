import { ProgressLocation, window } from 'vscode';
import { CaptureSource, LineRange, CaptureInput } from './model';
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
	console.log("CONTENT");
	console.log("Content: ", content?.substring(0,4));
	console.log("Linerange: ", lineRange);
	showQuickPick(source);


  return await ui.showImgCaptionMade(source);
}

// async function getCaption(
//   inputContent: CaptureInput,
//   source: CaptureSource) {
//   return await window.withProgress(
//     {
//       location: ProgressLocation.Window,
//       cancellable: false,
//       title: 'Loading Caption...',
//     },
//     async () => {
//       return await axios({
//         url: ``,
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         data: {
//           name: inputContent.title
//         },
//       });
//     }
//   );
// }

async function inferContextFromActiveEditor(): Promise<{
  lineRange?: [number, number];
	content?: string;
}>{
	const editor = window.activeTextEditor;

	if (!editor) {
		// const dummy2 :number = 3;
		// const dummy3 :number = 5;
		// const dummy1 : LineRange = [dummy2, dummy3];
		// const dummy4 : string = "STRING";
		// const dummy : Promise<{
		// 	lineRange?: [number, number];
		// 	content: string;
		// }> = {dummy1, dummy4};
    return {};
  }

	const { start, end } = editor.selection;
  const lineRange: LineRange = [start.line + 1, end.line + 1];
  const content = editor.document.getText(editor.selection);
	
	return { lineRange, content };
}
