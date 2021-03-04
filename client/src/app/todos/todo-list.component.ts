import { Component, OnDestroy, OnInit } from '@angular/core';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  providers: []
})
export class TodoListComponent implements OnInit, OnDestroy {

  public serverFilteredTodos: Todo[];
  public filteredTodos: Todo[];

  public todoOwner: string;
  public todoStatus: boolean;
  public todoCategory: string;
  public todoBody: string;
  getTodosSub: Subscription;

  constructor(private todoService: TodoService) { }

  getTodosFromServer(): void {
    this.unsub();
    this.getTodosSub = this.todoService.getTodos({
      owner: this.todoOwner,
      status: this.todoStatus,
      category: this.todoCategory
    }).subscribe(returnedTodos => {
      this.serverFilteredTodos = returnedTodos;
      this.updateFilter();
    }, _err => {
      console.log(_err);
    });
  }

  public updateFilter(): void {
    this.filteredTodos = this.todoService.filterTodos(
      this.serverFilteredTodos, { owner: this.todoOwner, category: this.todoCategory, body: this.todoBody});
  }

  /**
   * Starts an asynchronous operation to update the todos list
   */
  ngOnInit(): void {
    this.getTodosFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getTodosSub) {
      this.getTodosSub.unsubscribe();
    }
  }
}
