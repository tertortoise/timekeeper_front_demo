import {TasksFlatMap, TasksFlatMapKey, Task} from '../interfaces/tasks';

import {parseTasksFlatMapToSelectionList} from './parseTasksFlatMapToSelectionList';

export const mockUnitsMap = {
  cat01: {
    level: 0,
    name: 'category 1',
    description: 'description of category 1',
    children: ['proj01_cat01', 'proj02_cat01'],
    archived: false,
  },
  proj01_cat01: {
    level: 1,
    name: 'project 1',
    description: 'description of project 1',
    children: ['task01_proj01_cat01', 'task02_proj01_cat01'],
    parent: 'cat01',
    archived: false,
  },
  task01_proj01_cat01: {
    level: 2,
    name: 'task 1',
    description: 'description of project 1',
    parent: 'proj01_cat01',
    archived: false,
  },
  task02_proj01_cat01: {
    level: 2,
    name: 'task 2',
    description: 'description of project 1',
    parent: 'proj01_cat01',
    archived: false,
  },
  proj02_cat01: {
    level: 1,
    name: 'project 2',
    description: 'description of project 2',
    children: ['task01_proj02_cat01', 'task02_proj02_cat01'],
    parent: 'cat01',
    archived: false,
  },
  task01_proj02_cat01: {
    level: 2,
    name: 'task 1',
    description: 'description of project 1',
    parent: 'proj02_cat01',
    archived: false,
  },
  task02_proj02_cat01: {
    level: 2,
    name: 'task 2',
    description: 'description of project 1',
    parent: 'proj02_cat01',
    archived: false,
  },
  cat02: {
    level: 0,
    name: 'category 2',
    description: 'description of category 2',
    children: ['proj01_cat02', 'proj02_cat02'],
    archived: false,
  },
  proj01_cat02: {
    level: 1,
    name: 'project 1',
    description: 'description of project 1',
    children: ['task01_proj01_cat01', 'task02_proj01_cat01'],
    parent: 'cat02',
    archived: false,
  },
  task01_proj01_cat02: {
    level: 2,
    name: 'task 1',
    description: 'description of project 1',
    parent: 'proj01_cat02',
    archived: false,
  },
  task02_proj01_cat02: {
    level: 2,
    name: 'task 2',
    description: 'description of project 1',
    parent: 'proj01_cat02',
    archived: false,
  },
  proj02_cat02: {
    level: 1,
    name: 'project 2',
    description: 'description of project 2',
    children: ['task01_proj02_cat02', 'task02_proj02_cat02'],
    parent: 'cat02',
    archived: false,
  },
  task01_proj02_cat02: {
    level: 2,
    name: 'task 1',
    description: 'description of project 1',
    parent: 'proj02_cat02',
    archived: false,
  },
  task02_proj02_cat02: {
    level: 2,
    name: 'task 2',
    description: 'description of project 1',
    parent: 'proj02_cat02',
    archived: false,
  },
}

//TODO tests
console.log(parseTasksFlatMapToSelectionList(mockUnitsMap))

