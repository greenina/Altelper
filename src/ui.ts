import { CaptureSource, LineRange } from './capture/model';
import { window, env, Uri, ParameterInformation, CodeAction, WorkspaceEdit, CodeActionKind, Range, TextDocument, Selection } from 'vscode';
import DomParser = require('dom-parser');

export let pastRec:string[] = [];
export const tmpRecList = ["1Rec",'2Rec', '3Rec', '4Rec'];
export async function showQuickPick(text: CaptureSource) {
	// TODO: axios로 capturesource에 의한 caption recommentation 받아오기
	const imgTag = text.content;
	const parser = new DomParser();
	if(!imgTag){
		return window.showInformationMessage('Check if you selected the valid code');
	}
	const dom = parser.parseFromString(imgTag);
	const element = dom.getElementsByTagName('img');
	if(!element){
		return window.showInformationMessage('Check if you selected the valid code');
	}
	const srcText = element[0].getAttribute("src");
	if(!srcText){
		console.log("srcText NULL");
		return {};
	}
	const altRec = getCaptionRec(srcText);
	reLoadHistory(srcText, altRec, text);

}

async function reLoadHistory(src: string, elem:string, original: CaptureSource){
	if(!src){
		console.log("src null");
	}
	if(!elem){
		console.log("elem null");
	}
	console.log("reLoadHistory of ", src, elem);
	const list = [elem];
	list.push("Draw Another Recommendation");
	const uiList = list.concat(pastRec);
	let index = 0;
	const result = await window.showQuickPick(uiList, {
		placeHolder: 'Select recommendation',
		onDidSelectItem: item => {
			index = uiList.indexOf(String(item));
			// TODO: 실제로는 recommendation 1개랑 draw 하는 버튼으로 설정해야할듯! 또는 시간 없으면 그냥 recommendation 만...
			return window.showInformationMessage('Selected!');
		}
	});
	if(index == 1){
		const newRec = getCaptionRec(src);
		pastRec.push(elem);
		console.log("Recorrd Updated: ", pastRec);
		reLoadHistory(src, newRec, original);
	} else {
		showInputBox(src, result, original);
	}
}

function getCaptionRec(src:string) {
	if(!src){
		console.log("No src to get cap");
		return "AA";
	}
	const i = Math.round(Math.random()*3);
	return tmpRecList[i];
}
// async function createFix(document: vscode.TextDocument, range: vscode.Range, emoji: string): vscode.CodeAction {
// 	const fix = new vscode.CodeAction(`Convert to ${emoji}`, vscode.CodeActionKind.QuickFix);
// 	fix.edit = new vscode.WorkspaceEdit();
// 	fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 2)), emoji);
// 	return fix;
// }
export async function resetAlt(document: TextDocument, original: CaptureSource, result: string|undefined, src:string){
	const editor = window.activeTextEditor;
	if(!original.lineRange){
		return{};
	}
	const selection = new Selection(original.lineRange.start, original.lineRange.end);
	if(!result){
		return{};
	}
	const final = `<img src="` + src + `" alt="` + result + `" />`;
	editor?.edit(editBuilder => {
		editBuilder.replace(selection, final);
	});
	
	// TODO: reset pastRec
	pastRec = [];
}
export async function showInputBox(src: string, selected: string|undefined, original: CaptureSource) {
	const result = await window.showInputBox({
		value: selected,
		placeHolder: 'Modify your selection',
		validateInput: text => {
			window.showInformationMessage(`Validating: ${text}`);
			return text === '123' ? 'Not 123!' : null;
		}
	});
	if(!window.activeTextEditor?.document){
		return {};
	}
	resetAlt(window.activeTextEditor.document, original, result, src);
	window.showInformationMessage(`Got: ${result}`);
}

export async function showImgCaptionMade(source: CaptureSource) {
  await window.showInformationMessage(
    'Image Caption Created'
  );
}



