import { CaptureSource, LineRange, CaptureInput } from './capture/model';
import { window, env, Uri, ParameterInformation } from 'vscode';
import DomParser = require('dom-parser');

export const pastRec:string[] = [];
export const tmpRecList = ["1Rec",'2Rec', '3Rec', '4Rec'];
export async function showQuickPick(text: CaptureSource) {
	// TODO: axios로 capturesource에 의한 caption recommentation 받아오기
	const imgTag = text.content;
	const parser = new DomParser();
	if(!imgTag){
		console.log("imgTag NULL");
		return window.showInformationMessage('Check if you selected the valid code');
	}
	const dom = parser.parseFromString(imgTag);
	console.log("DOM: ", dom);
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
	// list.push(elem);
	// list.push("Draw another recommendation");
	// const uiList = list.concat(pastRec);
	reLoadHistory(srcText, altRec);

	// const result = await window.showQuickPick(uiList, {
	// 	placeHolder: 'Select recommendation',
	// 	onDidSelectItem: item => {
	// 		// if(list.indexOf(String(item)) == 1){
	// 		// }
	// 		// TODO: 실제로는 recommendation 1개랑 draw 하는 버튼으로 설정해야할듯! 또는 시간 없으면 그냥 recommendation 만...
	// 		return window.showInformationMessage(`Focus ${++i}: ${item}`);
	// 	}
	// });
	// showInputBox(result);
	// window.showInformationMessage(`Got: ${result}`);
	// TODO: 이 showInformation 부분에서 send 버튼을 누르게 하면 되겠다. 근데 필수적인 것 아님. 
}

async function reLoadHistory(src: string, elem:string){
	console.log("HIStory: ", pastRec);
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
		reLoadHistory(src, newRec);
	} else {
		showInputBox(result);
	}
}

function getCaptionRec(src:string) {
	if(!src){
		console.log("No nsrc to get cap");
		return "AA";
	}
	const i = Math.round(Math.random()*3);
	console.log("I: ", i);
	console.log("SRc to get caption: ", src);
	return tmpRecList[i];
}
/**
 * Shows an input box using window.showInputBox().
 */
export async function showInputBox(selected: string|undefined) {
	const result = await window.showInputBox({
		value: selected,
		placeHolder: 'Modify your selection',
		validateInput: text => {
			window.showInformationMessage(`Validating: ${text}`);
			return text === '123' ? 'Not 123!' : null;
		}
	});
	window.showInformationMessage(`Got: ${result}`);
}

export async function inputCaptureContent(
  lineRange: LineRange | undefined
): Promise<CaptureInput | undefined> {
  function describeLineRange(lineRange: LineRange | undefined) {
    if (!lineRange) {
      return '';
    }

    const [start, end] = lineRange;
    return start === end ? `line ${start}` : `lines ${start}-${end}`;
  }

  const titleResult = await window.showInputBox({
    placeHolder: 'Enter a title for your rule',
    prompt: `What rule do you want to capture at ${describeLineRange(lineRange)}?`,
    validateInput: (value) => (value.trim() === '' ? 'Title is required' : ''),
  });

  if (!titleResult) {
    // exit early when no title given
    return;
  }

  const descriptionResult = await window.showInputBox({
    placeHolder: 'Add a description',
    prompt: `Give your rule a description (optional)`,
  });

  const result: CaptureInput = {
    title: titleResult.trim(),
    description: descriptionResult?.trim() ?? '',
  };

  return result;
}

export async function showImgCaptionMade(source: CaptureSource) {
  await window.showInformationMessage(
    'Image Caption Created'
  );
}



