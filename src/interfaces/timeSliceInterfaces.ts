
export type DateStartEndType = 'start' | 'end';

export enum TimeSliceTypes {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

// TEMP should be deprecated - full info instead
export interface DateGroupObjTSTSpecific {
  year: number;
  month?: number;
  week?: number;
  date?: number;
}

export type DateGroupObjFull = Required<DateGroupObjTSTSpecific>;
export interface DateGroupObj {
  full: DateGroupObjFull;
  timeSliceTypeSpecific: DateGroupObjTSTSpecific;
}

export interface TimeSlice {
  timeSlicingType?: TimeSliceTypes;
  sliceStart: number;
  sliceEnd: number;
  timeSliceNumber: number;
  entityIsMultiSlice: boolean;
  startsInPast: boolean; //baseEntity start date is earlier than slice start
  endsInFuture: boolean;//baseEntity end date is earlier than slice start
  startDateGroupObj: DateGroupObjFull
}

//TEMP delete with TrackerTimeEntries
export interface TimeSliceWorkAround extends DateGroupObjTSTSpecific {
  timeSliceType: TimeSliceTypes;
  sliceStart: number;
  sliceEnd: number;
  timeSliceNumber: number;
  entityIsMultiSlice: boolean;
  startsInPast: boolean; //baseEntity start date is earlier than slice start
  endsInFuture: boolean; //baseEntity end date is earlier than slice start
}

// TEMP
export interface EntityTimeSlice extends TimeSliceWorkAround {
  timeSliceCount: number;
  entityId: string;
  entityDataRefIdx: number;
}

export interface EntityTimeDataSlice<T> {
  entityTimeSlice: EntityTimeSlice,
  entityDataSlice: T
}

export interface TETimeSlice extends TimeSlice {
  timeEntryId: string,
  LTEDataRefIndex: number,
}