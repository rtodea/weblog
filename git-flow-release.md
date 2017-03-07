## Introduction

Software Development Life Cycle
[SDLC](https://en.wikipedia.org/wiki/Systems_development_life_cycle)
Software Release Life Cycle [SRLC](https://en.wikipedia.org/wiki/Software_release_life_cycle)

## Git Flow
[](http://danielkummer.github.io/git-flow-cheatsheet/)


## Semanting Versioning 2.0.0
a.k.a. [semver](http://semver.org/)


## Closing the Release
1. be up to date with master and develop on local
2. (release/X.Y.0) update package.json X.Y.0 ->  Release version X.Y.0 (commit + push)
3. git flow release finish X.Y.0
4. fix conflicts, run tests locally + eslint, check app is working, git commit (Merge branch release ‘’ into develop is generated)
5. run again git flow release finish X.Y.0
6. git push origin develop
7. git checkout master
8. git push origin master
9. git push —tags

## Opening a Release
 1. git checkout develop
 2. update CHANGES.md (set release version instead of current release) (git commit prepare CHANGES.md for VERSION)
 3. git flow release start VERSION
 4. (release/VERSION) update package -> commit (Set version to X-Y.0-RC1)+ git tag VERSION-RC1 + git push —tags
 5. (develop) update package.json version to VERSION+1-snapshot + CHANGES.md