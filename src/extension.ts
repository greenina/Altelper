import * as vscode from 'vscode';
import capture, { shouldResumeCapture } from './capture/command';
import * as ui from './ui';


const COMMAND = 'code-actions-sample.command';

export function activate(context: vscode.ExtensionContext) {
	console.log("enter activate");
	const captureCommand = vscode.commands.registerCommand('cs491i.capture', capture);
	console.log("ready to push");
	context.subscriptions.push(captureCommand);
}



// private createFix(document: vscode.TextDocument, range: vscode.Range, emoji: string): vscode.CodeAction {
// 	const fix = new vscode.CodeAction(`Convert to ${emoji}`, vscode.CodeActionKind.QuickFix);
// 	fix.edit = new vscode.WorkspaceEdit();
// 	fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 2)), emoji);
// 	return fix;
// }