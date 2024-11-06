import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NoteDialogComponent,
      multi: true
    }
  ]
})
export class NoteDialogComponent implements ControlValueAccessor {
  title: string;
  category: string;
  noteContent: string;

  constructor(
    public dialogRef: MatDialogRef<NoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; category: string; note: string }
  ) {
    // Initialize properties safely in the constructor
    this.title = data.title || '';
    this.category = data.category || '';
    this.noteContent = data.note || '';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({ title: this.title, category: this.category, noteContent: this.noteContent });
  }

  onContentInput(event: Event): void {
    const value = (event.target as HTMLElement).innerText;
    this.noteContent = value;
    this.onChange(value);
  }

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.noteContent = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement this method if needed to handle disabled state
  }
}
