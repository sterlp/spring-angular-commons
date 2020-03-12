<p align="center">
    <img alt="GitHub Actions status" src="https://github.com/sterlp/spring-angular-commons/workflows/Build%20Spring%20Angular/badge.svg">
</p>

# How to build and release

- Adjust version
- Clean all `rm -rf dist/`
- Build all `ng test --watch=false`
- Build all `ng build`
- Commit
- Login `npm login`

## Publish ng-spring-boot-api
- `cd dist/ng-spring-boot-api/`
- `npm publish --access public`

# Links
- https://angular.io/guide/creating-libraries

# Spring Boot API

- Simple TypeScript classes for common spring boot pojos.
- [spring-boot-api on npmjs](https://www.npmjs.com/package/@sterlp/ng-spring-boot-api)

# How to use

- Add lib to the project `npm install @sterlp/ng-spring-boot-api --save`
- Switch to the angular component you want to use the *interfaces*
- Add e.g. `import { Page, HateoasEntityList } from '@sterlp/ng-spring-boot-api';`

## Usage of the Hateoas API classes

```typescript
list(pageable: Pageable): Observable<HateoasEntityList<YourModel, HateoasResourceLinks>> {
    return this.http.get<HateoasEntityList<YourModel, HateoasResourceLinks>>('/api/your-resource', {
        params: pageable ? pageable.newHttpParams() : null
    });
}
```

## Create a Spring REST service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SpringResourece } from '@sterlp/ng-spring-boot-api';

@Injectable({ providedIn: 'root' })
export class YourService extends SpringResourece<YourModelList, YourModel> {
    constructor(http: HttpClient) { super(http); }
    get listUrl(): string { return '/api/your-resource-model'; }
}
```
## Spring-Angular DataSource

Uses a Spring REST service to load data e.g. for a material data table

### Create an own DataSource

```typescript
export class YourModelDataSource extends SpringDataSource<YourModelList, YourModel, YourService> {
    extractDataFromList(list: YourModelList): YourModel[] {
        // hateoas list resource example ...
        return list && list._embedded && list._embedded.yourModel ? list._embedded.yourModel : null;
    }
}
```

### Listen to total element changes of the data source

Example based on a mterial table with a material paginator. Sorting included in the example.

```typescript
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    yourDataSource: YourModelDataSource;

    constructor(private yourService: YourService) { }

    ngOnInit() {
        this.yourDataSource = new YourModelDataSource(this.yourService);

        this.paginator.page.subscribe(this.yourDataSource.doPage.bind(this.yourDataSource));
        this.yourDataSource.hateosSubject$.subscribe(v => {
            if (v && v.page) this.paginator.length = v.page.totalElements;
            else this.paginator.length = 0;
        });
        // for sorting
        this.sort.sortChange.subscribe(this.yourDataSource.doSortBy.bind(this.yourDataSource));
    }
    ngAfterViewInit(): void {
        this.yourDataSource.doLoad(this.paginator.pageIndex, this.paginator.pageSize);
    }
```

### SubscriptionsHolder

Common problem is always to clean up all subscriptions if a component is destroyed. To support this the `SubscriptionsHolder` can be used.

```typescript
export class YourComponent implements OnDestroy {

  private subs = new SubscriptionsHolder();

  constructor(private router: Router) { }

  ngOnInit() {
    // e.g. subscribe to any route changes
    this.subs.add(this.route.params.subscribe(params => {
      // do what ever needs to be done ...
    }));

    // add custom code which should be executed too
    this.subs.add({
        close() {
            // do cleanup stuff
        }
    })
  }

  ngOnDestroy(): void {
    this.subs.close(); // destroy all subscriptions ...
  }
}
```
