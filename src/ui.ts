import { CaptureSource, LineRange, CaptureInput } from './capture/model';
import { window, env, Uri } from 'vscode';
import DomParser = require('dom-parser');



export async function showQuickPick(text: CaptureSource) {
	// TODO: axios로 capturesource에 의한 caption recommentation 받아오기
	let i = 0;
	const imgTag = text.content;
	const parser = new DomParser();
	const list: string[] | Thenable<string[]> = [];
	if(!imgTag){
		return {};
	}
	const dom = parser.parseFromString(imgTag);
	console.log("DOM: ", dom);
	const element = dom.getElementsByTagName('img');
	if(!element){
		return window.showInformationMessage('Check if you selected the valid code');
	}
	const elem = element[0].getAttribute("src");
	if(!elem || !list){
		return {};
	}
	list.push(elem);
	list.push("Draw another recommendation");

	const result = await window.showQuickPick(list, {
		placeHolder: 'Select recommendation',
		onDidSelectItem: item => {
			// if(list.indexOf(String(item)) == 1){
			// }
			// TODO: 실제로는 recommendation 1개랑 draw 하는 버튼으로 설정해야할듯! 또는 시간 없으면 그냥 recommendation 만...
			return window.showInformationMessage(`Focus ${++i}: ${item}`);
		}
	});
	showInputBox(result);
	// window.showInformationMessage(`Got: ${result}`);
	// TODO: 이 showInformation 부분에서 send 버튼을 누르게 하면 되겠다. 근데 필수적인 것 아님. 
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



