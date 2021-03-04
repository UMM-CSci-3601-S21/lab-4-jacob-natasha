import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Todo } from '../app/todos/todo';
import { TodoService } from '../app/todos/todo.service';

/**
 * A "mock" version of the 'TodoService'
 */
@Injectable()
export class MockTodoService extends TodoService {
  static testTodos: Todo[] = [
    {
      _id: 'Frys_id',
      owner: 'Fry',
      status: true,
      category: 'video games',
      body: 'Catch five fish in Animal Crossing'
    },
    {
      _id: 'Barrys_id',
      owner: 'Barry',
      status: true,
      category: 'video games',
      body: 'Get all 120 stars in Super Mario 64'
    },
    {
      _id: 'Blanches_id',
      owner: 'Blanche',
      status: true,
      category: 'software design',
      body: 'Finish lab 4'
    },
    {
      _id: 'Workmans_id',
      owner: 'Workman',
      status: false,
      category: 'groceries',
      body: 'Get 4 frozen pizzas'
    }
  ];

  constructor() {
    super(null);
  }

  getTodos(filters: {owner?: string; category?: string; status?: boolean}): Observable<Todo[]> {
    // Just returns the test todos without filters
    return of(MockTodoService.testTodos);
  }

  getTodoById(id: string): Observable<Todo> {
    if (id === MockTodoService.testTodos[0]._id) {
      return of(MockTodoService.testTodos[0]);
    } else {
      return of(null);
    }
  }

}
