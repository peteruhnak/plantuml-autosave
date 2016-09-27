'use babel';

import { CompositeDisposable } from 'atom';
import * as plantuml from 'node-plantuml';
import 'fs';

export default {

  subscriptions: null,
  nailgun: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => this.handleEvents(editor)));
  },

  deactivate() {
    if (this.nailgun) {
      this.nailgun.shutdown();
      this.nailgun = null;
    }
    this.subscriptions.dispose();
  },

  serialize() {
  },

  handleEvents(editor) {
    if (editor.getGrammar().scopeName != 'source.plantuml') {
      return;
    }
    if (!this.nailgun) {
      this.nailgun = plantuml.useNailgun();
    }

    const buffer = editor.getBuffer();
    buffer.onWillSave(() => {
      this.saveImageFor(editor.getPath(), editor.getText());
    });
  },

  saveImageFor(sourcePath, content) {
    const format = 'png';
    const targetPath = sourcePath.replace(/\.[^.]+$/, '') + '.' + format;
    const options = {
      format : format
    }
    const gen = plantuml.generate(content, options);
    console.log(targetPath);
    const writeStream = fs.createWriteStream(targetPath);
    get.out.pipe(writeStream);
  },

};
