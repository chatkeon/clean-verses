import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly HEADING_REGEX = new RegExp('(.+)(\n[0-9]+ )', 'g');
  private readonly FOOTNOTE_REGEX = new RegExp('\[[a-z0-9]+]', 'gi');
  private readonly FIRST_NUMBER_REGEX = new RegExp('([0-9]+) ');
  private readonly VERSE_NUMBER_REGEX = new RegExp('^[0-9]+');

  removeVerseNumbers: boolean = false;
  removeHeadings: boolean = false;
  removeFootnotes: boolean = false;
  insertNewlines: boolean = true;
  results: string = '';

  cleanVerses(text: string) {
    let cleanedVerses = text.trim();

    // Mark headings
    cleanedVerses = cleanedVerses.replace(this.HEADING_REGEX, 'HEADING_$1_HEADING\n$2');

    cleanedVerses = this.processText(cleanedVerses);

    if (this.removeFootnotes) {
      cleanedVerses = cleanedVerses.replace(this.FOOTNOTE_REGEX, '');
    }

    if (this.removeHeadings) {
      cleanedVerses = cleanedVerses.replace(/HEADING_.+_HEADING\n/g, '');
    } else {
      cleanedVerses = cleanedVerses.replace(/HEADING_(.+)_HEADING\n/g, '\n$1\n\n');
    }

    // Clean up
    cleanedVerses = cleanedVerses.replace(/\n\n+/g, '\n\n').replace(/\n /g, '\n').trim();

    this.results = cleanedVerses;
  }

  processText(textToProcess: string): string {
    let processedText;

    const firstNumberMatch = this.FIRST_NUMBER_REGEX.exec(textToProcess);
    if (firstNumberMatch) {
      const firstNumberIndex = firstNumberMatch.index;
      processedText = textToProcess.slice(0, firstNumberIndex);
      let unprocessedText = textToProcess.split('');
      unprocessedText.splice(0, processedText.length);

      let verseNum = unprocessedText.join('').match(this.VERSE_NUMBER_REGEX)![0];
      let nextVerseRegex = new RegExp(`^${verseNum} `);
      while (unprocessedText.length > 0) {
        if (nextVerseRegex.test(unprocessedText.join(''))) {
          if (this.insertNewlines) {
            processedText += '\n';
          }

          if (!this.removeVerseNumbers) {
            processedText += `${verseNum} `;
          }
          unprocessedText.splice(0, verseNum.length);

          // TODO: Add handling for crossing over chapters
          verseNum = `${parseInt(verseNum) + 1}`;
          nextVerseRegex = new RegExp(`^${verseNum} `);
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
