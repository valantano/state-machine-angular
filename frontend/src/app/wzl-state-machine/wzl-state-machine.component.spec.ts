import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WzlStateMachineComponent } from './wzl-state-machine.component';

describe('WzlStateMachineComponent', () => {
  let component: WzlStateMachineComponent;
  let fixture: ComponentFixture<WzlStateMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WzlStateMachineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WzlStateMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
