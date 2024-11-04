import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-html-display',
  templateUrl: './html-display.component.html',
  styleUrls: ['./html-display.component.css']
})
export class HtmlDisplayComponent {
  private content: string[] = [
    "<h2>Page 1</h2><p>This is <strong>page 1</strong> content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>",
    "<h2>Page 2</h2><p>This is <em>page 2</em> content. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
    // Add more pages as needed
  ];

  currentPage: number = 1;
  totalPages: number = this.content.length;

  isContextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };
  colors: string[] = ['red', 'green', 'blue', 'orange', 'purple', 'yellow'];
  contextMenuOpened: boolean = false; // New flag to track menu state
  ignoreNextClick: boolean = false;   // Guard to manage click timing

  getCurrentPageContent(): string {
    return this.content[this.currentPage - 1];
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  showContextMenu(event: MouseEvent): void {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Prevent default context menu from appearing
      event.preventDefault();
      this.isContextMenuVisible = true;
      this.contextMenuPosition.x = event.pageX;
      this.contextMenuPosition.y = event.pageY;

      // Mark context menu as opened and set the guard
      this.contextMenuOpened = true;
      this.ignoreNextClick = true;   // Ignore the next click

      // Delay allowing outside click detection
      setTimeout(() => {
        this.ignoreNextClick = false;   // Reset guard after timeout
      }, 0);
    } else {
      this.hideContextMenu();
    }
  }

  hideContextMenu(): void {
    this.isContextMenuVisible = false;
    this.contextMenuOpened = false; // Reset flag when hiding
  }

  highlightText(): void {
    console.log("Highlighting text...");
    // Implement highlight functionality here
    this.hideContextMenu();
  }

  addNote(): void {
    console.log("Adding note...");
    // Implement add note functionality here
    this.hideContextMenu();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (this.ignoreNextClick) return; // Skip handling if ignoring

    const contextMenu = document.querySelector('.context-menu');
    // Only hide if the menu is open and the click is outside the menu
    if (this.isContextMenuVisible && contextMenu && !contextMenu.contains(event.target as Node)) {
      this.hideContextMenu();
    }
  }

  @HostListener('contextmenu', ['$event'])
  preventContextMenu(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu
  }
}
