import { TasksFlatMap, TasksFlatMapKey, Task, TaskSelectionUnit } from '../interfaces/tasks';

// as of the moment without hierarchy
export const parseTasksFlatMapToSelectionList = (tasksFlatMap: TasksFlatMap): TaskSelectionUnit[] => {
  const tasksSelectionList: TaskSelectionUnit[] = [];

  const addToTasksSelectionListItem = (id: TasksFlatMapKey, taskSelectionUnit?: TaskSelectionUnit) => {

    const taskSelectionUnitHierarchyItem: Task = {
      id,
      name: tasksFlatMap[id].name,
      description: tasksFlatMap[id].description,
      level: tasksFlatMap[id].level,
      archived: tasksFlatMap[id].archived
    };

    let label = `${tasksFlatMap[id].name}`;
    let hierarchy = [taskSelectionUnitHierarchyItem];
    if (taskSelectionUnit) {
      label = `${taskSelectionUnit.label} \u{27A7} ${label}`;
      hierarchy = [...taskSelectionUnit.hierarchy, taskSelectionUnitHierarchyItem];
    }
    const taskSelectionUnitToAdd = {
      id,
      label,
      hierarchy,
    };
    tasksSelectionList.push(taskSelectionUnitToAdd);
    if (!tasksFlatMap[id].children?.length) {
      return;
    } else {
      tasksFlatMap[id].children?.forEach(childId => {
        addToTasksSelectionListItem(childId, taskSelectionUnitToAdd);
      })
    }
  }

  for (const [keyId, value] of Object.entries(tasksFlatMap)) {
    if (value.level) {
      continue;
    } else {
      addToTasksSelectionListItem(keyId);
    }

  }
  return tasksSelectionList;
}
