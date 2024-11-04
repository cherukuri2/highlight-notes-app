import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { AppComponent } from './app.component';
import { HtmlDisplayComponent } from './html-display/html-display.component';



@NgModule({
  declarations: [
    AppComponent,
    HtmlDisplayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule  // Add FormsModule here
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this line
  bootstrap: [AppComponent]
})
export class AppModule { }
