import { TestBed } from '@angular/core/testing';

import { BehaviorTreeService } from './behavior-tree.service';

describe('BehaviorTreeService', () => {
  let service: BehaviorTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BehaviorTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
