import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SpringDataSource } from './spring.datasource';
import { SpringResource } from './spring.resource';
import { Observable, of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';

interface ListBean { foo?: string; }
interface Bean {}

class MySpringService extends SpringResource<ListBean, Bean> {
    get listUrl(): string {
        return 'api/foo';
    }

    search(): Observable<ListBean> {
        return of({});
    }
}

class MySpringDataSource extends SpringDataSource<ListBean, Bean, MySpringService> {
    result: Bean[] = [];
    extractDataFromList(list: ListBean): Bean[] {
        return this.result;
    }
}

describe('Spring DataSource', () => {
    let httpClientSpy: { get: jasmine.Spy };

    let service: MySpringService;
    let subject: MySpringDataSource;
    let serviceSpy: any;

    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
        service = new MySpringService(httpClientSpy as any);
        subject = new MySpringDataSource(service);
    });
    afterEach(() => {
        httpClientSpy = null;
        service = null;
        subject = null;
    });

    it('DataSource will call service', () => {
        serviceSpy = spyOn(service, 'list').and.returnValue(of({foo: 'bar'} as ListBean));
        subject.result = [{}, {}];

        subject.dataSubject$.pipe(first()).subscribe(values => expect(values.length).toBe(0));

        subject.doLoad();

        expect(service.list).toHaveBeenCalledTimes(1);

        subject.hateosSubject$.subscribe(v => {
            expect(v).toBeDefined();
            expect(v.foo).toBe('bar');
        });
        subject.dataSubject$.subscribe(values => expect(values.length).toBe(2));
    });

    it('DataSource error handler hook', () => {
        let error;
        subject = new MySpringDataSource(service, (e) => {
            error = e;
            return of({foo: 'error'});
        });

        serviceSpy = spyOn(service, 'list').and.returnValue(throwError(new Error('nope ...')));
        subject.doLoad();

        expect(service.list).toHaveBeenCalledTimes(1);

        subject.hateosSubject$.subscribe(v => {
            expect(v).toBeDefined();
            expect(v.foo).toBe('error');
        });
        expect(error.message).toBe('nope ...');
        subject.dataSubject$.subscribe(values => expect(values.length).toBe(0));
    });

    it('DataSource no error handler', () => {
        subject = new MySpringDataSource(service);

        serviceSpy = spyOn(service, 'list').and.returnValue(throwError(new Error('nope ...')));
        subject.doLoad();

        expect(service.list).toHaveBeenCalledTimes(1);

        subject.hateosSubject$.subscribe(v => {
            expect(v).toBe(null);
        });
        subject.dataSubject$.subscribe(values => expect(values.length).toBe(0));
    });

    it('DataSource search hook', () => {
        serviceSpy = spyOn(service, 'list').and.returnValue(of({foo: 'bar1'} as ListBean));
        serviceSpy = spyOn(service, 'search').and.returnValue(of({foo: 'bar2'} as ListBean));

        subject = new MySpringDataSource(service, null, (s, page) => {
            expect(page.page).toBe(33);
            expect(page.size).toBe(66);
            return s.search();
        });

        subject.doLoad(33, 66);
        subject.doLoad(33, 66);
        subject.doLoad(33, 66);

        expect(service.list).toHaveBeenCalledTimes(0);
        expect(service.search).toHaveBeenCalledTimes(3);

        subject.hateosSubject$.subscribe(v => {
            expect(v).toEqual({foo: 'bar2'});
        });
        subject.dataSubject$.subscribe(values => expect(values.length).toBe(0));
    });

});
