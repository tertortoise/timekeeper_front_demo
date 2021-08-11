import { DataSyncable } from './dataSyncable';

export interface TaskItem {
  level: number;
  name: string;
  description?: string;
  parent?: string;
  children?: string[];
  archived: boolean;
}

export interface Task extends TaskItem {
  id: string;
}

export interface TasksFlatMap {
  [key: string]: TaskItem;
}

export type TasksFlatMapKey = Extract<keyof TasksFlatMap, string>;

export interface TasksFlatMapData extends DataSyncable<TasksFlatMap> {
    data?: TasksFlatMap;
}

export interface TaskSelectionUnit {
  id: string;
  label: string;
  hierarchy: Task[];
}