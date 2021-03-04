import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

import { Todo } from './todo';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from './todo.service';
import { MockTodoService } from '../../testing/todo.service.mock';

const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('Todo List', () => {

  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ TodoListComponent ],
      providers: [{ provide: TodoService, useValue: new MockTodoService() }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('Contains all the todos', () => {
    expect(todoList.serverFilteredTodos.length).toBe(4);
  });

  it('Contains a todo owned by Barry', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.owner === 'Barry')).toBe(true);
  });

  it('Doesn\'t contain a todo owned by George', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.owner === 'George')).toBe(false);
  });

  it('Has three todos that are complete', () => {
    expect(todoList.serverFilteredTodos.filter((todo: Todo) => todo.status === true).length).toBe(3);
  });
});

describe('Misbehaving Todo List', () => {

  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoServiceStub: {
    getTodos: () => Observable<Todo[]>;
    getTodosFiltered: () => Observable<Todo[]>;
  };

  beforeEach(() => {

    todoServiceStub = {
      getTodos: () => new Observable(observer => {
        observer.error('Error-prone observable');
      }),
      getTodosFiltered: () => new Observable(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ TodoListComponent ],
      providers: [{ provide: TodoService, useValue: todoServiceStub }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('Generates an error if we don\'t set up a TodoListService', () => {
    // Since the observer throws an error, we don't expect todos to be defined
    expect(todoList.serverFilteredTodos).toBeUndefined();
  });
});
