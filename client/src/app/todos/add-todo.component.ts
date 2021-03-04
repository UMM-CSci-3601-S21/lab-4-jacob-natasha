import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Todo } from './todo';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  todo: Todo;

  addTodoValidationMessages = {
    owner: [
      {type: 'required', message: 'Owner name is required'},
      {type: 'minlength', message: 'Owner name must be at least 2 characters long'},
      {type: 'maxlength', message: 'Owner name cannot be more than 50 characters long'}
    ],

    status: [
      {type: 'required', message: 'Status is required'},
      {type: 'pattern', message: 'A todo must be complete or incomplete'}
    ],

    category: [
      {type: 'required', message: 'Category is required'},
      {type: 'minlength', message: 'Category must be at least 5 characters long'},
      {type: 'maxlength', message: 'Category cannot be more than 50 characters long'}
    ],

    body: [
      {type: 'required', message: 'Description is required'},
      {type: 'minlength', message: 'Description must be at least 2 characters long'},
      {type: 'maxlength', message: 'Description cannot be more than 500 characters long'}
    ]
  };

  constructor(private fb: FormBuilder, private todoService: TodoService, private snackBar: MatSnackBar, private router: Router) { }

  createForms() {
    this.addTodoForm = this.fb.group({
      owner: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        (fc) => {
          if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
            return ({existingOwner: true});
          } else {
            return null;
          }},])),
      status: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^(true|false)$'),
      ])),
      category: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        (fc) => {
          if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
            return ({existingCategory: true});
          } else {
            return null;
          }},])),
      body: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(500),
        (fc) => {
          if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
            return ({existingBody: true});
          } else {
            return null;
          }},])),
    });
  }

  ngOnInit(): void {
    this.createForms();
  }

  submitForm() {
    this.todoService.addTodo(this.addTodoForm.value).subscribe(newID => {
      this.snackBar.open('Created Todo ' + this.addTodoForm.value.owner, null, {
        duration: 2000,
      });
      this.router.navigate(['/todos/', newID]);
    }, _err => {
      this.snackBar.open('Failed to create the todo', 'OK', {
        duration: 5000,
      });
    });
  }

}
