import { CaptureSource, LineRange } from './capture/model';
import { window, env, Uri, ParameterInformation, CodeAction, WorkspaceEdit, CodeActionKind, Range, TextDocument, Selection, Diagnostic } from 'vscode';
import DomParser = require('dom-parser');
import axios from 'axios';

export let pastRec:string[] = [];
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
	const altRec = await getCaptionRec(srcText, div_text);
	await reLoadHistory(srcText, altRec, text, div_text);

}

async function reLoadHistory(src: string, elem:string|undefined, original: CaptureSource, div_text: string){
	// console.log("reLoadHistory of ", src, elem);
	if(!elem){
		return {};
	}
	const list = ["Write from scratch",elem];
	// list.push(elem);
	const uiList = list.concat(pastRec);
	let index = 0;
	const result = await window.showQuickPick(uiList, {
		placeHolder: 'Select recommendation',
		onDidSelectItem: item => {
			index = uiList.indexOf(String(item));
			// return window.showInformationMessage('Selected!');
		}
	});
	// if(index == 1){
	// 	const newRec = await getCaptionRec(src, div_text);
	// 	pastRec.push(elem);
	// 	// console.log("Recorrd Updated: ", pastRec);
	// 	reLoadHistory(src, newRec, original, div_text);
	// } else {
	// 	showInputBox(src, result, original, div_text);
	// }
	if(index == 0){
		showInputBox(src, "", original, div_text);
	} else {
		showInputBox(src, result, original, div_text);
	}
}

async function getCaptionRec(src:string|undefined, div_text: string) {
	if(!src){
		console.log("No src to get cap");
		return;
	}

	// TOJIHO: 그냥 captioning model에서는 div_text가 없을테고 이때 default 값은 "Not Captured"로 설정돼있어. 
	// "Not Captured"일 경우 인준이 모델 말고, huggingface 모델에 imgUrl input만 받아서 alt text res 주면 될 것 같아.  

	const result = await axios
		.post(`http://aria.sparcs.org:15001/api/v1/predict`, {
			url: src,
			// context: div_text
		})
		.then((res) => {
			console.log("RES: ", res.data.alt);
			return res.data.alt; // res type: json : {alt: String}
	});
	return result;
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
	// TOJIHO: 
	// axios.post(`URL`,{
	// 	imgUrl: src,
	// 	finalAlt: result
	// });
	// respond는 success 여부 boolean으로 보내주면 될듯! 
	resetAlt(window.activeTextEditor.document, original, result, src, div_text);
	// window.showInformationMessage(`Got: ${result}`);
}

export async function showImgCaptionMade(source: CaptureSource) {
  await window.showInformationMessage(
    'Image Caption Recommendation Made\n If yet, please wait for a few sec'
  );
}



