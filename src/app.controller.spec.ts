import { describe, expect, it } from 'vitest';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  const controller = new AppController(new AppService());

  it('greets with the group name', () => {
    expect(controller.getHello()).toContain('IS41R');
  });

  it('reports a healthy status', () => {
    expect(controller.getHealth()).toEqual({
      status: 'ok',
      service: 'students',
      group: 'IS41R',
    });
  });
});
