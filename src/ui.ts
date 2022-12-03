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
		return window.showInformationMessage('Check if you entered valid src');
	}
	const altRec = getCaptionRec(srcText);
	reLoadHistory(srcText, altRec, text);

}

async function reLoadHistory(src: string, elem:string, original: CaptureSource){
	console.log("reLoadHistory of ", src, elem);
	const list = ["Draw Another Recommendation"];
	list.push(elem);
	const uiList = list.concat(pastRec);
	let index = 0;
	const result = await window.showQuickPick(uiList, {
		placeHolder: 'Select recommendation',
		onDidSelectItem: item => {
			index = uiList.indexOf(String(item));
			// return window.showInformationMessage('Selected!');
		}
	});
	if(index == 0){
		const newRec = getCaptionRec(src);
		pastRec.push(elem);
		// console.log("Recorrd Updated: ", pastRec);
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
	
	pastRec = [];
}
export async function showInputBox(src: string, selected: string|undefined, original: CaptureSource) {
	const result = await window.showInputBox({
		value: selected,
		placeHolder: 'You can modify your selection',
		validateInput: text => {
			// window.showInformationMessage(`Validating: ${text}`);
			return text==='123'?'123':null;
		}
	});
	if(!window.activeTextEditor?.document){
		return window.showInformationMessage('Check if your editor is activated');
	}
	resetAlt(window.activeTextEditor.document, original, result, src);
	// window.showInformationMessage(`Got: ${result}`);
}

export async function showImgCaptionMade(source: CaptureSource) {
  await window.showInformationMessage(
    'Image Caption Created'
  );
}



