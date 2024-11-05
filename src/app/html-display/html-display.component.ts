import { Component, OnInit } from '@angular/core';

interface Highlight {
  text: string;
  color: string;
  page: number;
  startOffset: number;
  endOffset: number;
}

@Component({
  selector: 'app-html-display',
  templateUrl: './html-display.component.html',
  styleUrls: ['./html-display.component.css']
})
export class HtmlDisplayComponent implements OnInit {
  content: string[] = [
    'This is content for record 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content for record 2. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.',
    'This is content for record 3. In condimentum facilisis porta.',
    'This is content for record 4. Sed nec diam eu diam mattis viverra.',
    'This is content for record 5. Nulla fringilla, orci ac euismod semper.'
  ];
  pageContent: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 1;
  totalPages: number = Math.ceil(this.content.length / this.itemsPerPage);

  isContextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };
  colors: string[] = ['yellow', 'pink', 'lightgreen', 'lightblue', 'orange', 'lightgrey'];
  selectedColorIndex: number | null = null;
  selectionText: string = '';
  selectionRange: Range | null = null;

  highlights: Highlight[] = [];

  ngOnInit(): void {
    console.log('onInit called...');
    localStorage.removeItem('highlights');
    this.loadPageContent();
    this.loadHighlightsFromStorage();
  }

  loadPageContent(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pageContent = this.content.slice(startIndex, endIndex);
    console.log('Current page content ' + this.pageContent);
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
      const highlight: Highlight = {
        text: this.selectionText,
        color: color,
        page: this.currentPage,
        startOffset: this.selectionRange.startOffset,
        endOffset: this.selectionRange.endOffset
      };
      this.highlights.push(highlight);
      this.saveHighlightsToStorage();
      this.applyHighlight(highlight);
      this.hideContextMenu();
    }
  }

  applyHighlight(highlight: Highlight): void {
    console.log('inside highlight ' + highlight.page);
    const contentElements = document.querySelectorAll('.content-item');

    contentElements.forEach(contentElement => {
      console.log('contentElement => ' + contentElement.outerHTML);
      const textNodes = Array.from(contentElement.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
      console.log('textNodes ' + textNodes.length);
      textNodes.forEach(textNode => {
        const text = textNode.textContent || '';
        console.log('text ==>  ' + text);
        if (text.includes(highlight.text)) {
          const startIndex = text.indexOf(highlight.text);
          const endIndex = startIndex + highlight.text.length;

          if (startIndex === highlight.startOffset && endIndex === highlight.endOffset) {
            const beforeText = text.slice(0, startIndex);
            const highlightedText = text.slice(startIndex, endIndex);
            const afterText = text.slice(endIndex);

            const span = document.createElement('span');
            span.style.backgroundColor = highlight.color;
            span.textContent = highlightedText;

            console.log('Highlight span element HTML:', span.outerHTML);

            const beforeNode = document.createTextNode(beforeText);
            const afterNode = document.createTextNode(afterText);
            contentElement.replaceChild(afterNode, textNode);
            contentElement.insertBefore(span, afterNode);
            contentElement.insertBefore(beforeNode, span);

            console.log('Updated contentElement HTML:', contentElement.innerHTML);

          }
        }
      });
    });
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
    console.log('this.currentPage ' + this.currentPage);
    console.log('this.highlights => ' + JSON.stringify(this.highlights));
    this.highlights
      .filter(highlight => highlight.page === this.currentPage)
      .forEach(highlight => this.applyHighlight(highlight));
  }

  addNote(): void {
    console.log("Add Note functionality not implemented yet.");
  }
}
