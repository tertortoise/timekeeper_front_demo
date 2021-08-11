[Link to demo app](https://timekeeperdemo-ec3f9.web.app/)

## Project overview
TimeKeeper is a portfolio project written in Typescript / React / Redux-Saga / Material UI with backend. Persistence is don on Firestore (Google Firebase).
It is a (very) simplified time tracker that allows user to enter new time entry, stop it, cancel it, edit and view and edit existing time entries.

## Editing time entries
Edits to time entries are done **inline / inplace** (i.e. not in a seperate form). Changes are commited to backend on selection / blur (once there is a change in the value).
Entity being edited is rendered non-editable.
Existing time entries fields in the list are editable. For performance reasons they are technically rendered as view compoenents and are changed inplace to editable components on user interaction.

## Notifications
Some transactions (mostly CRUD) are accompanied by notifications (can be closed by a user, or if left alone - they autohide).

## Active timer

- enter and edit current time entry: write description, assign task (predefined static hierarchical list) and start time
- stop (and create new time entry)
- cancel

## Existing time entries grouping
There are several options for grouping of existing time entries:
- **two-level grouping**. Group by week or month and subgroup by day inside week/month groups (week / day and month / day options)
- **one-level grouping** by month / week / day
- no time grouping
- **additional subgrouping** by task is also possible if some type of type grouping is chosen
- time groups and task subgroups are **foldable**. Folding is 'retained' (i.e. if a day is folded within a week container, folding or unfolding week container will not affect the folding state of that day subcontainer)
- **time slicing**. If time entry (as a data entity) belongs to two or more time periods (i.e. starts on 23:00 and ends 1:00 next day and grouping by day is selected) it is brokend down into relevant time sliced views. But if one edits such time slice, time entry entity is being edited (i.e. all time slices views will reflect the change after edit is commited). Transitional start/end dates of time slices are not editable
- sorting is done in descending order based on start time. If task subgrouping is checked, task subgroup represents a sort of time entry slice within a selected time period with start being the earliest of child time entries start dates and end - the latest

As this is a demo project, paging and/or virtualization of lists are omitted.
## Operation on a standalone time entry
- basic CRUD transactions and some extra
- edit existing time entry (inline). Dates are restricted to not earlier / or not later than their counterparts (start may not be later than end, end may not be later than start)
- **create timer from existing time entry**. In this case if there is a timer running, then there will be 2 batched transactions: create time entry from active timer, create timer from time entry
- **duplicate time entry**
- delete time entry

## Tasks
Within this demo project tasks are static hierarchical list, available in Combo boxes for timer / time entry, but the list and tasks themselves are not editable.
Assignment may be done both to **node and leaf** of the hierarchical task list. I.e. if task named 'Project 1' has a parent named 'Category 1', then one may assign time entry not only to 'Project 1', but to 'Category 1' as well.
Only 1 task (or none) can be assigned to a time entry.
List of tasks can be viewed on a seperate page.



