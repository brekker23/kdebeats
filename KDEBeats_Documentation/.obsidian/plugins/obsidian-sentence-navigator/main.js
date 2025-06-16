var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main.ts
__export(exports, {
  default: () => SentenceNavigator
});
var import_obsidian2 = __toModule(require("obsidian"));

// src/constants.ts
var WHOLE_SENTENCE = /[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/gm;
var LIST_CHARACTER_REGEX = /^\s*(-|\+|\*|\d+\.|>) (\[.\] )?$/;

// src/state.ts
var State = {
  sentenceRegex: null
};

// src/utils.ts
var getLineBoundaries = (editor, line) => ({
  start: {
    line,
    ch: 0
  },
  end: {
    line,
    ch: editor.getLine(line).length
  }
});
var getCursorAndParagraphText = (editor) => {
  const cursorPosition = editor.getCursor();
  return {
    cursorPosition,
    paragraphText: editor.getLine(cursorPosition.line)
  };
};
var forEachSentence = (paragraphText, callback) => {
  const sentences = paragraphText.matchAll(State.sentenceRegex);
  for (const sentence of sentences) {
    const stopIterating = callback(sentence);
    if (stopIterating) {
      break;
    }
  }
};
var setCursorAtStartOfLine = (editor, line) => {
  editor.setCursor({
    line,
    ch: 0
  });
};
var setCursorAtEndOfLine = (editor, line) => {
  editor.setCursor({
    line,
    ch: editor.getLine(line).length
  });
};
var setCursorAtNextWordCharacter = ({
  editor,
  cursorPosition,
  paragraphText,
  direction
}) => {
  let ch = cursorPosition.ch;
  if (direction === "start") {
    while (ch > 0 && paragraphText.charAt(ch - 1) === " ") {
      ch--;
    }
  } else {
    while (ch < paragraphText.length && paragraphText.charAt(ch) === " ") {
      ch++;
    }
  }
  editor.setCursor({
    ch,
    line: cursorPosition.line
  });
};
var getPrevNonEmptyLine = (editor, currentLine) => {
  let prevLine = currentLine - 1;
  while (prevLine > 0 && editor.getLine(prevLine).length === 0) {
    prevLine--;
  }
  return prevLine;
};
var getNextNonEmptyLine = (editor, currentLine) => {
  let nextLine = currentLine + 1;
  while (nextLine < editor.lineCount() && editor.getLine(nextLine).length === 0) {
    nextLine++;
  }
  return nextLine;
};
var isAtStartOfListItem = (cursorPosition, paragraphText) => {
  const { ch } = cursorPosition;
  const maybePrefix = paragraphText.slice(0, ch);
  return LIST_CHARACTER_REGEX.test(maybePrefix);
};

// src/actions.ts
var deleteToBoundary = (editor, boundary) => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);
  const originalCursorPosition = cursorPosition;
  if (paragraphText.charAt(cursorPosition.ch) === " " || paragraphText.charAt(cursorPosition.ch - 1) === " ") {
    setCursorAtNextWordCharacter({
      editor,
      cursorPosition,
      paragraphText,
      direction: boundary
    });
    ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));
  }
  let done = false;
  forEachSentence(paragraphText, (sentence) => {
    if (!done && cursorPosition.ch >= sentence.index && cursorPosition.ch <= sentence.index + sentence[0].length) {
      if (boundary === "start") {
        const sentenceTextBeforeCursor = paragraphText.substring(0, sentence.index) + paragraphText.substring(originalCursorPosition.ch);
        const cutPortionLength = paragraphText.length - sentenceTextBeforeCursor.length;
        const { start, end } = getLineBoundaries(editor, cursorPosition.line);
        editor.replaceRange(sentenceTextBeforeCursor, start, end);
        editor.setCursor({
          line: cursorPosition.line,
          ch: originalCursorPosition.ch - cutPortionLength
        });
      } else {
        const remainingSentenceLength = sentence.index + sentence[0].length - cursorPosition.ch;
        const newParagraph = paragraphText.substring(0, originalCursorPosition.ch) + paragraphText.substring(cursorPosition.ch + remainingSentenceLength);
        const { start, end } = getLineBoundaries(editor, cursorPosition.line);
        editor.replaceRange(newParagraph, start, end);
        editor.setCursor(originalCursorPosition);
      }
      done = true;
    }
  });
};
var selectToBoundary = (editor, boundary) => {
  const { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);
  let done = false;
  forEachSentence(paragraphText, (sentence) => {
    if (!done && cursorPosition.ch >= sentence.index && cursorPosition.ch <= sentence.index + sentence[0].length) {
      if (editor.getSelection().length > 0 && (cursorPosition.ch === sentence.index || cursorPosition.ch === sentence.index + sentence[0].length)) {
        return true;
      }
      if (boundary === "start") {
        const sentenceTextBeforeCursor = paragraphText.substring(0, sentence.index) + paragraphText.substring(cursorPosition.ch);
        const precedingLength = paragraphText.length - sentenceTextBeforeCursor.length;
        const start = __spreadProps(__spreadValues({}, cursorPosition), {
          ch: cursorPosition.ch - precedingLength
        });
        editor.setSelection(cursorPosition, start);
      } else {
        const remainingLength = sentence.index + sentence[0].length - cursorPosition.ch;
        const end = __spreadProps(__spreadValues({}, cursorPosition), {
          ch: cursorPosition.ch + remainingLength
        });
        editor.setSelection(cursorPosition, end);
      }
      done = true;
    }
  });
};
var moveToStartOfCurrentSentence = (editor) => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);
  if (cursorPosition.ch === 0 || isAtStartOfListItem(cursorPosition, paragraphText)) {
    setCursorAtEndOfLine(editor, getPrevNonEmptyLine(editor, cursorPosition.line));
  }
  ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));
  forEachSentence(paragraphText, (sentence) => {
    const startOfSentence = sentence.index;
    while (cursorPosition.ch > 0 && paragraphText.charAt(cursorPosition.ch - 1) === " ") {
      editor.setCursor({
        line: cursorPosition.line,
        ch: cursorPosition.ch - 1
      });
      ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));
    }
    if (cursorPosition.ch > startOfSentence && startOfSentence + sentence[0].length >= cursorPosition.ch) {
      const newPosition = startOfSentence;
      editor.setCursor({
        line: cursorPosition.line,
        ch: newPosition
      });
      if (newPosition >= paragraphText.length) {
        setCursorAtStartOfLine(editor, getPrevNonEmptyLine(editor, cursorPosition.line));
      }
    }
  });
};
var moveToStartOfNextSentence = (editor) => {
  let { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);
  if (cursorPosition.ch === paragraphText.length) {
    setCursorAtStartOfLine(editor, getNextNonEmptyLine(editor, cursorPosition.line));
  } else {
    forEachSentence(paragraphText, (sentence) => {
      const startOfSentence = sentence.index;
      const endOfSentence = startOfSentence + sentence[0].length;
      while (cursorPosition.ch < paragraphText.length && paragraphText.charAt(cursorPosition.ch) === " ") {
        editor.setCursor({
          line: cursorPosition.line,
          ch: cursorPosition.ch + 1
        });
        ({ cursorPosition, paragraphText } = getCursorAndParagraphText(editor));
      }
      if (cursorPosition.ch >= startOfSentence && cursorPosition.ch <= endOfSentence) {
        const newPosition = {
          line: cursorPosition.line,
          ch: endOfSentence
        };
        setCursorAtNextWordCharacter({
          editor,
          cursorPosition: newPosition,
          paragraphText,
          direction: "end"
        });
        if (endOfSentence >= paragraphText.length) {
          setCursorAtStartOfLine(editor, getNextNonEmptyLine(editor, cursorPosition.line));
        }
      }
    });
  }
};
var selectSentence = (editor) => {
  const { cursorPosition, paragraphText } = getCursorAndParagraphText(editor);
  let found = false;
  let paragraphTextProcessed = paragraphText;
  let offset = 0;
  const matches = paragraphText.match(/^(\d+\.|[-*+]) /);
  if (matches) {
    offset = matches[0].length;
    paragraphTextProcessed = paragraphText.slice(offset);
  }
  forEachSentence(paragraphTextProcessed, (sentence) => {
    if (!found && cursorPosition.ch <= offset + sentence.index + sentence[0].length) {
      editor.setSelection({ line: cursorPosition.line, ch: offset + sentence.index }, {
        line: cursorPosition.line,
        ch: offset + sentence.index + sentence[0].length
      });
      found = true;
    }
  });
};

// src/settings.ts
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  sentenceRegexSource: WHOLE_SENTENCE.source
};
var SettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Sentence Navigator" });
    const regexSetting = new import_obsidian.Setting(containerEl).setName("Sentence regex").setDesc("The regular expression used to match a sentence").addTextArea((textArea) => textArea.setPlaceholder("Enter regex").setValue(this.plugin.settings.sentenceRegexSource).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.sentenceRegexSource = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Reset default regex").addButton((btn) => {
      btn.setButtonText("Reset").onClick(() => __async(this, null, function* () {
        this.plugin.settings = __spreadValues({}, DEFAULT_SETTINGS);
        regexSetting.components[0].setValue(DEFAULT_SETTINGS.sentenceRegexSource);
        yield this.plugin.saveSettings();
      }));
    });
  }
};

// src/main.ts
var SentenceNavigator = class extends import_obsidian2.Plugin {
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.addCommand({
        id: "backward-delete-sentence",
        name: "Delete to start of sentence",
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "Backspace" }],
        editorCallback: (editor) => deleteToBoundary(editor, "start")
      });
      this.addCommand({
        id: "forward-delete-sentence",
        name: "Delete to end of sentence",
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "Delete" }],
        editorCallback: (editor) => deleteToBoundary(editor, "end")
      });
      this.addCommand({
        id: "backward-select-sentence",
        name: "Select to start of sentence",
        editorCallback: (editor) => selectToBoundary(editor, "start")
      });
      this.addCommand({
        id: "forward-select-sentence",
        name: "Select to end of sentence",
        editorCallback: (editor) => selectToBoundary(editor, "end")
      });
      this.addCommand({
        id: "move-start-current-sentence",
        name: "Move to start of current sentence",
        editorCallback: (editor) => moveToStartOfCurrentSentence(editor)
      });
      this.addCommand({
        id: "move-start-next-sentence",
        name: "Move to start of next sentence",
        editorCallback: (editor) => moveToStartOfNextSentence(editor)
      });
      this.addCommand({
        id: "select-sentence",
        name: "Select current sentence",
        editorCallback: (editor) => selectSentence(editor)
      });
      this.addSettingTab(new SettingTab(this.app, this));
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      const savedSettings = yield this.loadData();
      this.settings = __spreadValues(__spreadValues({}, DEFAULT_SETTINGS), savedSettings);
      State.sentenceRegex = new RegExp(this.settings.sentenceRegexSource, "gm");
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
      State.sentenceRegex = new RegExp(this.settings.sentenceRegexSource, "gm");
    });
  }
};

/* nosourcemap */