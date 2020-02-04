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