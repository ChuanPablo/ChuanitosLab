/* *****************************************************************************
 * ****                   C H U A N I T O ' S   L A B                       ****
 * *****************************************************************************
 * ** Title: Chuanito's Lab                                                   **
 * ** Author: Jan Zimmermann (@chuanito)                                      **
 * ** Version: 1.0                                                            **
 * ** License: MIT                                                            **
 * *****************************************************************************
 * ** Description: As the name suggests this is the coding lab of chuanito.   **
 * **              It is meant as a playground for many Angular/Django        **
 * **              Projects to come. First project is a professional CV for   **
 * **              potential employers to see. In the meantime version 1.0    **
 * **              lays the foundation for user integration and the general   **
 * **              code base infrastructure for future projects               **
 * *****************************************************************************
 * ** Change Log                                                              **
 * ** ----------------------------------------------------------------------- **
 * ** 1.0 - Creation | Professional CV | Underlying infrastructure for future **
 * **       projects (i.e. User support/management|layout|codebase|guidelines **
 * *****************************************************************************
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
