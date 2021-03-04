import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('Todo Service', () => {
  // A collection of test todos
  const testTodos: Todo[] = [
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
  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = new TodoService(httpClient);
  });

  // Assure that there are no more pending requests
  afterEach(() => {
    httpTestingController.verify();
  });

  it('getTodos() calls api/todos', () => {
    todoService.getTodos().subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    const req = httpTestingController.expectOne(todoService.todoUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(testTodos);
  });

  it('getTodos() calls api/todos with filter parameter \'owner\'', () => {

    todoService.getTodos({ owner: 'Fry' }).subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('owner')
    );

    expect(req.request.method).toEqual('GET');

    expect(req.request.params.get('owner')).toEqual('Fry');

    req.flush(testTodos);
  });

  it('getTodos() calls api/todos with multiple parameters', () => {

    todoService.getTodos({ owner: 'Fry', category: 'video games', status: true }).subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(todoService.todoUrl)
      && request.params.has('owner')
      && request.params.has('category')
      && request.params.has('status')
    );

    expect(req.request.method).toEqual('GET');

    expect(req.request.params.get('owner')).toEqual('Fry');
    expect(req.request.params.get('category')).toEqual('video games');
    expect(req.request.params.get('status')).toEqual('true');

    req.flush(testTodos);
  });

  it('filterTodos() filters by owner', () => {
    expect(testTodos.length).toBe(4);
    const todoOwner = 'a';
    expect(todoService.filterTodos(testTodos, { owner: todoOwner }).length).toBe(3);
  });

  it('filterTodos() filters by category', () => {
    expect(testTodos.length).toBe(4);
    const todoCategory = 'video games';
    expect(todoService.filterTodos(testTodos, { category: todoCategory }).length).toBe(2);
  });

  it('filterTodos() filters by keyWord', () => {
    expect(testTodos.length).toBe(4);
    const bodyKeyWord = 'Get';
    expect(todoService.filterTodos(testTodos, { body: bodyKeyWord }).length).toBe(2);
  });

  it('filterTodos() filters by owner and category', () => {
    expect(testTodos.length).toBe(4);
    const todoOwner = 'a';
    const todoCategory = 'video games';
    expect(todoService.filterTodos(testTodos, { owner: todoOwner, category: todoCategory }).length).toBe(1);
  });

  it('addTodo() posts to api/todos', () => {

    todoService.addTodo(testTodos[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(todoService.todoUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testTodos[1]);

    req.flush({id: 'testid'});
  });
});
