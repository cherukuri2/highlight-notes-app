import { Component, OnInit } from '@angular/core';

interface Highlight {
  text: string;
  color: string;
  page: number;
  contextBefore: string; // Few words before the highlight
  contextAfter: string; // Few words after the highlight
}

@Component({
  selector: 'app-html-display',
  templateUrl: './html-display.component.html',
  styleUrls: ['./html-display.component.css']
})
export class HtmlDisplayComponent implements OnInit {
  content: string[] = [
    'This is content 1 for record 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content 2 for record 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content 1 for record 2. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.',
    'This is content 2 for record 2. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.',
    'This is content 1 for record 3. In condimentum facilisis porta.',
    'This is content 2 for record 3. In condimentum facilisis porta.',
    'This is content 1 for record 4. Sed nec diam eu diam mattis viverra.',
    'This is content 2 for record 4. Sed nec diam eu diam mattis viverra.',
    'This is content 1 for record 5. Nulla fringilla, orci ac euismod semper.',
    'This is content 2 for record 5. Nulla fringilla, orci ac euismod semper.'
  ];
  pageContent: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalPages: number = Math.ceil(this.content.length / this.itemsPerPage);

  isContextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };
  colors: string[] = ['yellow', 'pink', 'lightgreen', 'lightblue', 'orange', 'lightgrey'];
  selectedColorIndex: number | null = null;
  selectionText: string = '';
  selectionRange: Range | null = null;

  highlights: Highlight[] = [];

  ngOnInit(): void {
    localStorage.removeItem('highlights');
    this.loadPageContent();
    this.loadHighlightsFromStorage();
  }

  loadPageContent(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pageContent = this.content.slice(startIndex, endIndex);
    // Wait for the DOM to update before applying highlights
    setTimeout(() => {
      this.applyHighlightsFromStorage();
    }, 0); // 0 milliseconds delay
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPageContent();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPageContent();
    }
  }

  showContextMenu(event: MouseEvent): void {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      this.selectionText = selection.toString();
      this.selectionRange = selection.getRangeAt(0);
      this.isContextMenuVisible = true;
      this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    }
  }

  hideContextMenu(): void {
    this.isContextMenuVisible = false;
  }

  selectColor(index: number): void {
    this.selectedColorIndex = index;
  }

  highlightText(): void {
    if (this.selectionText && this.selectedColorIndex !== null && this.selectionRange) {
      const color = this.colors[this.selectedColorIndex];

      // Save context before and after the highlighted text
      const contextBefore = this.getContextBefore(this.selectionRange.startContainer, this.selectionRange.startOffset);
      const contextAfter = this.getContextAfter(this.selectionRange.endContainer, this.selectionRange.endOffset);

      const highlight: Highlight = {
        text: this.selectionText,
        color: color,
        page: this.currentPage,
        contextBefore: contextBefore,
        contextAfter: contextAfter
      };

      this.highlights.push(highlight);
      this.saveHighlightsToStorage();
      this.applyHighlight(highlight);
      this.hideContextMenu();
    }
  }

  getContextBefore(node: Node, startOffset: number): string {
    const text = node.textContent || '';
    const words = text.slice(0, startOffset).trim().split(' ');
    return words.slice(Math.max(words.length - 5, 0)).join(' '); // Get last 5 words before
  }

  getContextAfter(node: Node, endOffset: number): string {
    const text = node.textContent || '';
    const words = text.slice(endOffset).trim().split(' ');
    return words.slice(0, 5).join(' '); // Get first 5 words after
  }

  applyHighlight(highlight: Highlight): void {
    const contentElements = document.querySelectorAll('.content-item');

    contentElements.forEach(contentElement => {
      const textNodes = Array.from(contentElement.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
      textNodes.forEach(textNode => {
        const text = textNode.textContent || '';
        const startIndex = text.indexOf(highlight.text);

        // Check if the context matches before and after the highlight text
        if (startIndex !== -1 && this.contextMatches(text, highlight, startIndex)) {
          const endIndex = startIndex + highlight.text.length;

          const beforeText = text.slice(0, startIndex);
          const highlightedText = text.slice(startIndex, endIndex);
          const afterText = text.slice(endIndex);

          const span = document.createElement('span');
          span.style.backgroundColor = highlight.color;
          span.textContent = highlightedText;

          const beforeNode = document.createTextNode(beforeText);
          const afterNode = document.createTextNode(afterText);
          contentElement.replaceChild(afterNode, textNode);
          contentElement.insertBefore(span, afterNode);
          contentElement.insertBefore(beforeNode, span);
        }
      });
    });
  }

  contextMatches(text: string, highlight: Highlight, startIndex: number): boolean {
    const beforeText = text.slice(0, startIndex);
    const afterText = text.slice(startIndex + highlight.text.length);

    const contextBeforeMatches = beforeText.trim().endsWith(highlight.contextBefore.trim());
    const contextAfterMatches = afterText.trim().startsWith(highlight.contextAfter.trim());

    return contextBeforeMatches && contextAfterMatches;
  }

  saveHighlightsToStorage(): void {
    localStorage.setItem('highlights', JSON.stringify(this.highlights));
  }

  loadHighlightsFromStorage(): void {
    const storedHighlights = localStorage.getItem('highlights');
    if (storedHighlights) {
      this.highlights = JSON.parse(storedHighlights).filter((h: Highlight) => h.page === this.currentPage);
    }
  }

  applyHighlightsFromStorage(): void {
    this.highlights
      .filter(highlight => highlight.page === this.currentPage)
      .forEach(highlight => this.applyHighlight(highlight));
  }

  addNote(): void {
    console.log("Add Note functionality not implemented yet.");
  }
}
