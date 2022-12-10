import * as vscode from 'vscode';
import capture, { shouldResumeCapture } from './capture/command';
import * as ui from './ui';


const COMMAND = 'code-actions-sample.command';

export function activate(context: vscode.ExtensionContext) {
	const captureCommand = vscode.commands.registerCommand('altelper.capture', capture);
	context.subscriptions.push(captureCommand);
}
