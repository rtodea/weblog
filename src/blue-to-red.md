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
we would like to automate the transition process.

## Requirements

Input:

1. credentials for the Blue app
1. credentials for the Red app
1. interval (start and end date)

Output:

1. timesheets created in Red app

## Breakdown

### Blue app
It has a CSV export feature that can provide the following columns:

* Project
* Issue Type
* Key
* Summary
* Priority
* "Billing - Project"
* Date Started
* Username
* Display Name
* Time Spent (h)
* Work Description

### Red app

_Add new timesheet_ form:

* Name --- it is actually the project name
* Start date --- it should be se to one 2 dates (1st or 16th of the current month)

_Edit timesheet_ form contains a _Time Entries_ table:

* Date
* Task code --- relevant ones are `*-EST`, `*-WEB`
* Blue number --- ticket identifier
* Task Description --- ticket title
* Hours

## Implementation Steps

1. Manually export from Blue the CSV report into `exportData.csv`
1. Split `exportData.csv` into per billing project entries
    1. what happens when some tickets lack the "Billing - Project" field?
        1. generate `no-billing.csv` file
    1. some are known to apply to different project regardless of the one assigned
        1. `special-tickets-in.csv` file for those must be provided
        1. `special-tickets-out.csv` file will be generated with the correct entries
1. For each billing project create a CSV report with the Red columns
1. Import the CSV into Red
    1. use a web driver to put the correct entries (e.g. [`webdriver.io`](http://webdriver.io/))
    1. use a [`*.user.js`](https://github.com/OpenUserJs/OpenUserJS.org/wiki/Userscript-beginners-HOWTO) 
    triggered by [`Tampermonkey`](https://github.com/OpenUserJs/OpenUserJS.org/wiki/Tampermonkey-for-Chrome)
