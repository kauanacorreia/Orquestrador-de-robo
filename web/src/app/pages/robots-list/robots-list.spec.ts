import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RobotsList } from './robots-list';

describe('RobotsList', () => {
  let component: RobotsList;
  let fixture: ComponentFixture<RobotsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RobotsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RobotsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
