import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-layout-ui-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  imports: [CommonModule],
})
export class AboutComponent {
  projectName = "Chuanito's Lab";

  features = [
    {
      title: 'Interactive CV Platform',
      description:
        'A dynamic way to showcase web development skills through an interactive CV website',
    },
    {
      title: 'User Management System',
      description:
        'Complete user registration and authentication with email confirmation',
    },
    {
      title: 'Personal CV Profiles',
      description:
        'Each user can create and customize their own professional CV profile',
    },
    {
      title: 'Career Details Hub',
      description:
        'Easy access to comprehensive career information and professional background',
    },
  ];

  constructor() {}
}
