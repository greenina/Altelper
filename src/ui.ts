import { CaptureSource, LineRange } from './capture/model';
import { window, env, Uri, ParameterInformation, CodeAction, WorkspaceEdit, CodeActionKind, Range, TextDocument, Selection, Diagnostic } from 'vscode';
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
	let div_elem = null;
	let div_text = "Not Captured";
	if(dom.getElementsByTagName('div')){
		div_elem = dom.getElementsByTagName('div');
		if(div_elem && div_elem[0]){
			div_text = div_elem[0].innerHTML;
		}	
	}
	if(!element){
		return window.showInformationMessage('Check if you selected the valid code');
	}
	const srcText = element[0].getAttribute("src");
	
	if(!srcText){
		return window.showInformationMessage('Check if you entered valid src');
	}
	const altRec = getCaptionRec(srcText, div_text);
	reLoadHistory(srcText, altRec, text, div_text);

}

async function reLoadHistory(src: string, elem:string, original: CaptureSource, div_text: string){
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
		const newRec = getCaptionRec(src, div_text);
		pastRec.push(elem);
		// console.log("Recorrd Updated: ", pastRec);
		reLoadHistory(src, newRec, original, div_text);
	} else {
		showInputBox(src, result, original, div_text);
	}
}

function getCaptionRec(src:string, div_text: string) {
	if(!src){
		console.log("No src to get cap");
		return "Dummy Rec";
	}
	// axios
	// 	.post(`URL`, {
	// 		imgUrl: src,
	// 		context: div_text
	// 		// 인준이 모델 적용 시 추가 예정 : context: string 
	// 	})
	// 	.then((res) => {
	// 		return res; // res type: json : {alt: String}
	// });
	const i = Math.round(Math.random()*3);
	return tmpRecList[i];
}

export async function resetAlt(document: TextDocument, original: CaptureSource, result: string|undefined, src:string, div_text: string){
	const editor = window.activeTextEditor;
	if(!original.lineRange){
		return{};
	}
	const selection = new Selection(original.lineRange.start, original.lineRange.end);
	if(!result){
		return{};
	}
	// TODO: algorithm refactoring : 아래처럼 하지 말고 original parsing 해서 height, weight 같은 다른 attribute도 반영 시키기
	const text_div = `<div>` + `${div_text == "Not Captured"?null:div_text}` + `</div>\n`; 
	const text_img = `<img \n	src="` + src + `" \n	alt="` + result + `"\n/>`;
	const final = div_text == "Not Captured"?text_img:text_div + text_img;
	editor?.edit(editBuilder => {
		editBuilder.replace(selection, final);
	});
	
	pastRec = [];
}
export async function showInputBox(src: string, selected: string|undefined, original: CaptureSource, div_text: string) {
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
	axios.post(`URL`,{
		imgUrl: src,
		finalAlt: result
	});
	// respond는 success 여부 boolean으로 보내주면 될듯! 
	resetAlt(window.activeTextEditor.document, original, result, src, div_text);
	// window.showInformationMessage(`Got: ${result}`);
}

export async function showImgCaptionMade(source: CaptureSource) {
  await window.showInformationMessage(
    'Image Caption Created'
  );
}



