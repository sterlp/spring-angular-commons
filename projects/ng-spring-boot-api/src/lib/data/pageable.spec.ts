import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Pageable, SortDirection, Sort } from './pageable.model';

describe('Spring Pageable', () => {

  it('Pageable simple string query', () => {
    const p = new Pageable().asc('foo');
    p.size = 10;
    expect(p.buildQuery()).toBe('page=0&size=10&sort=foo,asc');

    p.page = 3;
    expect(p.buildQuery()).toBe('page=3&size=10&sort=foo,asc');
  });

  it('Pageable use defaults', () => {
    const p = Pageable.of();

    expect(p.page).toBe(Pageable.DEFAULT_PAGE);
    expect(p.size).toBe(Pageable.DEFAULT_SIZE);
  });

  it('Pageable of marams', () => {
    const p = Pageable.of(2, 7);

    expect(p.page).toBe(2);
    expect(p.size).toBe(7);
  });

  it('Set sort', () => {
    const p = Pageable.of();
    p.asc('foo');
    p.desc('bar');

    expect(p.sort.length).toBe(2);

    p.setSort('aaa');
    const params = p.newHttpParams();
    expect(params.get('sort')).toBe('aaa,asc');
  });

  it('Clear sort', () => {
    const p = Pageable.of();
    p.asc('foo');
    p.desc('bar');

    expect(p.sort.length).toBe(2);

    p.setSort(null);
    const params = p.newHttpParams();
    expect(params.get('sort')).toBe(null);
  });

  it('Pageable newHttpParams', () => {
    const p = new Pageable().desc('foo');
    p.page = 10;
    p.size = 33;

    const params = p.newHttpParams();
    expect(params.get('page')).toBe('10');
    expect(params.get('size')).toBe('33');
    expect(params.get('sort')).toBe('foo,desc');
  });

  it('Pageable support custom filter', () => {
    const params = Pageable.of(0, 25).desc('foo')
      .addFilter('a', 'b')
      .addFilter('b', false)
      .newHttpParams();

    expect(params.toString()).toBe('page=0&size=25&sort=foo,desc&a=b&b=false');
  });
});
