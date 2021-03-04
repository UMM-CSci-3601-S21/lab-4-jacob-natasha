import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { AddTodoComponent } from './add-todo.component';
import { TodoService } from  './todo.service';

describe('AddTodoComponent', () => {
  let addTodoComponent: AddTodoComponent;
  let addTodoForm: FormGroup;
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      declarations: [ AddTodoComponent ],
      providers: [{ provide: TodoService, useValue: new MockTodoService() }]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
    addTodoComponent.ngOnInit();
    fixture.detectChanges();
    addTodoForm = addTodoComponent.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addTodoComponent).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('The owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls.owner;
    });

    it('should not allow empty owner names', () => {
      ownerControl.setValue('');
      expect(ownerControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      ownerControl.setValue('Chris Smith');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail on single character owner names', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long owner names', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the owner name', () => {
      ownerControl.setValue('l33t h4x0r');
      expect(ownerControl.valid).toBeTruthy();
    });
  });

  describe('The category field', () => {
    it('should allow empty values', () => {
      const categoryControl = addTodoForm.controls.category;
      categoryControl.setValue('');
      expect(categoryControl.valid).toBeTruthy();
    });
  });

  describe('The status field', () => {
    let statusControl: AbstractControl;

    beforeEach(() => {
      statusControl = addTodoForm.controls.status;
    });

    it('should not allow empty values', () => {
      statusControl.setValue('');
      expect(statusControl.valid).toBeFalsy();
      expect(statusControl.hasError('required')).toBeTruthy();
    });

    it('should allow "complete"', () => {
      statusControl.setValue('complete');
      expect(statusControl.valid).toBeTruthy();
    });

    it('should allow "incomplete"', () => {
      statusControl.setValue('incomplete');
      expect(statusControl.valid).toBeTruthy();
    });

    it('should not allow "Neither Complete or Incomplete"', () => {
      statusControl.setValue('Neither Complete or Incomplete');
      expect(statusControl.valid).toBeFalsy();
    });
  });
});
