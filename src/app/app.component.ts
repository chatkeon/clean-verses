import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly HEADING_REGEX: RegExp = new RegExp('\n([^\s\n]+)(\n[0-9]+ )', 'g');
  private readonly FIRST_NUMBER_REGEX: RegExp = new RegExp('([0-9]+) ');
  private readonly VERSE_NUMBER_REGEX: RegExp = new RegExp('^[0-9]+');
  private readonly CHAPTER_START_REGEX: RegExp = new RegExp('^([0-9]+) (.+)( ?2 )');
  private readonly FOOTNOTE_REGEX: RegExp = new RegExp('(\\[[a-z]+\\])+', 'gi');

  removeVerseNumbers: boolean = false;
  removeHeadings: boolean = true;
  removeFootnotes: boolean = true;
  insertNewlines: boolean = true;
  preserveWhitespace: boolean = false;
  results: string = '';
  currentYear: string = '';

  constructor() {
    this.currentYear = new Date().getFullYear().toString();
  }

  cleanVerses(text: string) {
    let cleanedVerses = this.processText(text);

    if (!this.preserveWhitespace) {
      cleanedVerses = cleanedVerses.replace(/\n/g, ' ').replace(/  +/g, ' ');
    }

    if (this.insertNewlines) {
      cleanedVerses = cleanedVerses.replace(/[\s\n]*(VERSE_[0-9]+_VERSE)/g, '\n$1');
    }

    if (this.removeFootnotes) {
      cleanedVerses = cleanedVerses.replace(this.FOOTNOTE_REGEX, '');
    }

    if (this.removeHeadings) {
      cleanedVerses = cleanedVerses.replace(/HEADING_.+_HEADING/g, '');
    } else {
      cleanedVerses = cleanedVerses.replace(/HEADING_(.+)_HEADING/g, '\n$1\n');
    }

    if (this.removeVerseNumbers) {
      cleanedVerses = cleanedVerses.replace(/VERSE_([0-9]+)_VERSE /g, '');
    } else {
      cleanedVerses = cleanedVerses.replace(/VERSE_([0-9]+)_VERSE/g, '$1');
    }

    this.results = cleanedVerses.trim();
  }

  private processText(textToProcess: string): string {
    let processedText;

    // Add a newline at the beginning - needed for the heading regex to process correctly
    textToProcess = `\n${textToProcess}`;
    textToProcess = textToProcess.replace(this.HEADING_REGEX, 'HEADING_$1_HEADING$2');

    const firstNumberMatch = this.FIRST_NUMBER_REGEX.exec(textToProcess);
    if (firstNumberMatch) {
      const firstNumberIndex = firstNumberMatch.index;
      processedText = textToProcess.slice(0, firstNumberIndex);
      let unprocessedText = textToProcess.split('');
      unprocessedText.splice(0, processedText.length);

      let verseNum = unprocessedText.join('').match(this.VERSE_NUMBER_REGEX)![0];
      let nextVerseRegex = new RegExp(`^${verseNum} `);
      while (unprocessedText.length > 0) {
        // Start of next verse
        if (nextVerseRegex.test(unprocessedText.join(''))) {
          processedText += `VERSE_${verseNum}_VERSE`;
          unprocessedText.splice(0, verseNum.length);
          verseNum = `${parseInt(verseNum) + 1}`;
          nextVerseRegex = new RegExp(`^${verseNum} `);

        // Start of next chapter
        } else if (this.CHAPTER_START_REGEX.test(unprocessedText.join(''))) {
          const chapterNum = unprocessedText.join('').match(this.VERSE_NUMBER_REGEX)![0];
          processedText += 'VERSE_1_VERSE';
          unprocessedText.splice(0, chapterNum.length);
          verseNum = '2';
          nextVerseRegex = new RegExp('^2 ');

        // Same verse
        } else {
          processedText += unprocessedText.shift();

        }
      }
    } else {
      processedText = textToProcess;
    }

    return processedText;
  }

  copyResults() {
    navigator.clipboard.writeText(this.results);
  }
}
