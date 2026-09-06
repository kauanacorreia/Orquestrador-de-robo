import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLogDialog } from './edit-log-dialog';

describe('EditLogDialog', () => {
  let component: EditLogDialog;
  let fixture: ComponentFixture<EditLogDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLogDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLogDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
