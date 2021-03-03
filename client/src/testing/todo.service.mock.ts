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
    //stub
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
