# Spring Boot API

Simple TypeScript classes for common spring boot pojos.

# How to use

- Add lib to the project `npm install @sterlp/ng-spring-boot-api --save`
- Switch to the angular component you want to use the *interfaces*
- Add e.g. `import { Page, HateosEntityList } from '@sterlp/ng-spring-boot-api';`

## Simple HTTP Hateos GET example

```typescript
list(pageable: Pageable): Observable<HateosEntityList<YourModel, HateosResourceLinks>> {
    return this.http.get<HateosEntityList<YourModel, HateosResourceLinks>>('/api/your-resource', {
        params: pageable ? pageable.newHttpParams() : null
    });
}
```
