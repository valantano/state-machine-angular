import { TestBed } from '@angular/core/testing';

import { WzlStateMachineService } from './wzl-state-machine.service';

describe('WzlStateMachineService', () => {
  let service: WzlStateMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WzlStateMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
