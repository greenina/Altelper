import { CaptureSource, LineRange } from './capture/model';
import { window, env, Uri, ParameterInformation, CodeAction, WorkspaceEdit, CodeActionKind, Range, TextDocument, Selection } from 'vscode';
import DomParser = require('dom-parser');
import axios from 'axios';

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
	const div_elem = dom.getElementsByTagName('div');
	if(!element || !div_elem){
		return window.showInformationMessage('Check if you selected the valid code');
	}
	const srcText = element[0].getAttribute("src");
	const div_text = div_elem[0].innerHTML;
	if(!srcText){
		return window.showInformationMessage('Check if you entered valid src');
	}
	const altRec = getCaptionRec(srcText);
	reLoadHistory(srcText, altRec, text);

}

async function reLoadHistory(src: string, elem:string, original: CaptureSource){
	// console.log("reLoadHistory of ", src, elem);
	const list = ["Write from Scratch","Draw Another Recommendation"];
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
	if(index == 1){
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
		return "Dummy Rec";
	}
	// axios
	// 	.post(`URL`, {
	// 		imgUrl: src
	// 		// 인준이 모델 적용 시 추가 예정 : context: string 
	// 	})
	// 	.then((res) => {
	// 		return res; // res type: json : {alt: String}
	// });
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
	// TODO: 아래처럼 하지 말고 original parsing 해서 height, weight 같은 다른 attribute도 반영 시키기
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



