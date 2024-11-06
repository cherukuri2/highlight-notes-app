import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NoteDialogComponent } from '../note-dialog/note-dialog.component';

interface Highlight {
  text: string;
  color: string;
  page: number;
  startOffset: number;
  endOffset: number;
}

interface Note {
  text: string;
  page: number;
  startOffset: number;
  endOffset: number;
  title: string;
  category: string;
  noteContent: string;
}

@Component({
  selector: 'app-html-display',
  templateUrl: './html-display.component.html',
  styleUrls: ['./html-display.component.css']
})
export class HtmlDisplayComponent implements OnInit {
  content: string[] = [
    'This is content 1 for record 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content 2 for record 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content 1 for record 2. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'This is content 2 for record 2. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
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
  notes: Note[] = [];

  selectedNote: Note | null = null;
  isNotePopoverVisible: boolean = false;
  notePopoverPosition = { x: 0, y: 0 };

    // For popover visibility
    isPopoverVisible: boolean = false;
    notePopoverElement: HTMLElement | null = null;

  constructor(public dialog: MatDialog, private renderer: Renderer2) {}


  ngOnInit(): void {
    localStorage.removeItem('highlights');
    localStorage.removeItem('notes');
    this.loadPageContent();
    this.loadHighlightsAndNotesFromStorage();
  }

  loadPageContent(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pageContent = this.content.slice(startIndex, endIndex);

    setTimeout(() => {
      this.applyHighlightsAndNotes();
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

      // Clear the selected color when the popup appears
      this.selectedColorIndex = null;
    }
  }

  hideContextMenu(): void {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

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
        this.saveToStorage();
        this.applyHighlight(highlight);
        this.hideContextMenu();
      }
    }
  }

  addNote(): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '400px',
      data: { title: '', category: '', noteContent: '' },
      panelClass: 'dialog-container',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectionRange) {
        const startOffset = this.getOffsetWithinMainDiv(this.selectionRange.startContainer, this.selectionRange.startOffset);
        const endOffset = this.getOffsetWithinMainDiv(this.selectionRange.endContainer, this.selectionRange.endOffset);

        const note: Note = {
          text: this.selectionText,
          page: this.currentPage,
          startOffset,
          endOffset,
          title: result.title,
          category: result.category,
          noteContent: result.noteContent
        };

        this.notes.push(note);
        this.saveToStorage();
        this.applyNoteIcon(note);
        this.hideContextMenu();
      }
    });
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
    this.applyTextDecoration(highlight.startOffset, highlight.endOffset, highlight.color);
  }

  applyNoteIcon(note: Note): void {
    this.applyTextDecoration(note.startOffset, note.endOffset, 'none', note);
  }

  applyTextDecoration(startOffset: number, endOffset: number, color: string, note: Note | null = null): void {
    const mainDiv = document.querySelector('.content-container');
    if (!mainDiv) return;

    const treeWalker = document.createTreeWalker(mainDiv, NodeFilter.SHOW_TEXT, null);
    let charCount = 0;
    let currentNode: Node | null;

    while ((currentNode = treeWalker.nextNode())) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        const text = currentNode.textContent || '';
        const nodeStart = charCount;
        const nodeEnd = charCount + text.length;

        if (nodeStart <= startOffset && nodeEnd >= endOffset) {
          const beforeText = text.slice(0, startOffset - nodeStart);
          const decoratedText = text.slice(startOffset - nodeStart, endOffset - nodeStart);
          const afterText = text.slice(endOffset - nodeStart);

          const span = document.createElement('span');
          span.style.backgroundColor = color;
          span.textContent = decoratedText;
          console.log('Inside applying.. ' + decoratedText + ' ' + color);

          if (note) {
            const iconButton = document.createElement('button');
            iconButton.style.backgroundColor = 'transparent';
            iconButton.style.border = 'none';
            iconButton.style.padding = '0';
            iconButton.style.width = '24px';  // Set width based on image size
            iconButton.style.height = '24px'; // Set height based on image size

            // Add an image inside the button
            const iconImage = document.createElement('img');
            iconImage.src = 'https://cdn1.iconfinder.com/data/icons/hawcons/32/699315-icon-44-note-text-1024.png';

            iconImage.alt = 'Note Icon';
            iconImage.style.width = '100%';
            iconImage.style.height = '100%';

            // Append the image to the button
            iconButton.appendChild(iconImage);

            // Set the onclick handler for the button
            iconButton.onclick = (event: MouseEvent) => this.openNotePopover(note, event);

            const beforeNode = document.createTextNode(beforeText);
            const afterNode = document.createTextNode(afterText);
            const parent = currentNode.parentNode;

            if (parent) {
              parent.replaceChild(afterNode, currentNode);
              parent.insertBefore(span, afterNode);
              span.insertBefore(iconButton, span.firstChild);
              parent.insertBefore(beforeNode, span);
            }
          }else{
            const beforeNode = document.createTextNode(beforeText);
            const afterNode = document.createTextNode(afterText);

            const parent = currentNode.parentNode;
            if (parent) {
              parent.replaceChild(afterNode, currentNode);
              parent.insertBefore(span, afterNode);
              parent.insertBefore(beforeNode, span);
            }
          }
          break;
        }
        charCount += text.length;
      }
    }
  }

  saveToStorage(): void {
    localStorage.setItem('highlights', JSON.stringify(this.highlights));
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  loadHighlightsAndNotesFromStorage(): void {
    const storedHighlights = localStorage.getItem('highlights');
    const storedNotes = localStorage.getItem('notes');
    if (storedHighlights) {
      this.highlights = JSON.parse(storedHighlights).filter((h: Highlight) => h.page === this.currentPage);
    }
    if (storedNotes) {
      this.notes = JSON.parse(storedNotes).filter((n: Note) => n.page === this.currentPage);
    }
  }

  applyHighlightsAndNotes(): void {
    this.highlights
      .filter(highlight => highlight.page === this.currentPage)
      .forEach(highlight => this.applyHighlight(highlight));

    this.notes
      .filter(note => note.page === this.currentPage)
      .forEach(note => this.applyNoteIcon(note));

  }

  openNotePopover(note: Note, event: MouseEvent): void {

    this.isPopoverVisible = true;
    // Store the element to track it for closing
    this.notePopoverElement = event.target as HTMLElement;


    this.selectedNote = note;
    this.isNotePopoverVisible = true;
    this.notePopoverPosition = { x: event.clientX + 10, y: event.clientY + 10 };
  }

  closeNotePopover(): void {
    this.isNotePopoverVisible = false;
    this.selectedNote = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Check if the click is outside the note popover
    if (this.isPopoverVisible && this.notePopoverElement) {
      const clickedInsidePopover = this.notePopoverElement.contains(event.target as Node);
      if (!clickedInsidePopover) {
        this.closeNotePopover();
      }
    }
  }
}
