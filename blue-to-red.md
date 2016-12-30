# Blue to Red

Let's imagine the following scenario.

We have two apps, one called _Blue_, and another called _Red_, both used
in the life of a software developer.

### When is Blue useful?

* creating tickets for requested bugs and features
* logging work hours

### When is Red useful?

* billing the work hours to the client
* submitting timesheets

At a regular interval, one copies the entries from Blue to Red by hand.

It is a tedious process and very error prone.

You would not want to forget some work hours, use wrong task codes, etc.

Leaving aside a similar analysis to [_Is it worth the time_](https://xkcd.com/1205/)
we would like to automate the transition process process.

## Requirements

Input:

1. credentials for the Blue app
1. credentials for the Red app
1. interval (start and end date)

Output:

1. timesheets created in Red app

## Breakdown

_TODO_