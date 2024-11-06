import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NoteDialogComponent } from '../note-dialog/note-dialog.component';

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
    'This is content 1 for record 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content 2 for record 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content 1 for record 2. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.',
    'This is content 2 for record 2. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.'
  ];
  pageContent: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 2;
  totalPages: number = Math.ceil(this.content.length / this.itemsPerPage);

  isContextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };
  colors = ['#ffcccb', '#add8e6', '#90ee90', '#ffebcd', '#e6e6fa', '#ffffe0'];
  selectedColorIndex: number | null = null;
  selectionText: string = '';
  selectionRange: Range | null = null;

  highlights: Highlight[] = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    localStorage.removeItem('highlights');
    this.loadPageContent();
    this.loadHighlightsFromStorage();
  }

  loadPageContent(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pageContent = this.content.slice(startIndex, endIndex);

    setTimeout(() => {
      this.applyHighlightsFromStorage();
    }, 0);
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
      const mainDiv = document.querySelector('.main-content');
      if (mainDiv && this.selectionRange) {
        const startOffset = this.getOffsetWithinMainDiv(this.selectionRange.startContainer, this.selectionRange.startOffset);
        const endOffset = this.getOffsetWithinMainDiv(this.selectionRange.endContainer, this.selectionRange.endOffset);

        const highlight: Highlight = {
          text: this.selectionText,
          color,
          page: this.currentPage,
          startOffset,
          endOffset
        };

        this.highlights.push(highlight);
        this.saveHighlightsToStorage();
        this.applyHighlight(highlight);
        this.hideContextMenu();
      }
    }
  }

  getOffsetWithinMainDiv(node: Node, offset: number): number {
    const mainDiv = document.querySelector('.main-content');
    if (!mainDiv) return -1;

    let totalOffset = 0;
    const treeWalker = document.createTreeWalker(mainDiv, NodeFilter.SHOW_TEXT, null);
    while (treeWalker.nextNode()) {
      const currentNode = treeWalker.currentNode;
      if (currentNode === node) {
        return totalOffset + offset;
      }
      totalOffset += currentNode.textContent?.length || 0;
    }
    return -1;
  }


  applyHighlight(highlight: Highlight): void {
    const mainDiv = document.querySelector('.content-container');
    if (!mainDiv) return;

    const treeWalker = document.createTreeWalker(mainDiv, NodeFilter.SHOW_TEXT, null);
    let currentNode: Node | null;
    let charCount = 0;

    while ((currentNode = treeWalker.nextNode())) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        const text = currentNode.textContent || '';
        const nodeStart = charCount;
        const nodeEnd = charCount + text.length;

        if (nodeStart <= highlight.startOffset && nodeEnd >= highlight.endOffset) {
          const beforeText = text.slice(0, highlight.startOffset - nodeStart);
          const highlightedText = text.slice(highlight.startOffset - nodeStart, highlight.endOffset - nodeStart);
          const afterText = text.slice(highlight.endOffset - nodeStart);

          const span = document.createElement('span');
          span.style.backgroundColor = highlight.color;
          span.textContent = highlightedText;

          const beforeNode = document.createTextNode(beforeText);
          const afterNode = document.createTextNode(afterText);

          const parent = currentNode.parentNode;
          if (parent) {
            parent.replaceChild(afterNode, currentNode);
            parent.insertBefore(span, afterNode);
            parent.insertBefore(beforeNode, span);
          }
          break;
        }
        charCount += text.length;
      }
    }
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
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '400px',
      data: { title: '', category: '', noteContent: '' },
      panelClass: 'dialog-container',  // Apply custom styling to the dialog container
    });

    // Apply the blur effect to the background when the dialog is opened
    document.body.classList.add('dialog-backdrop');

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Save the note to associate with the selected word or text
        console.log("Note saved:", result);
      }
      // Remove the blur effect when the dialog is closed
      document.body.classList.remove('dialog-backdrop');
    });
  }



}
