import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConfigDialogComponent } from './create-config-dialog.component';

describe('CreateConfigDialogComponent', () => {
  let component: CreateConfigDialogComponent;
  let fixture: ComponentFixture<CreateConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateConfigDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
