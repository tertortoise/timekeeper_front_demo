
import { DateGroupObjFull, TimeSliceTypes } from './timeSliceInterfaces';
import { DataSyncable, FetchStatus } from './dataSyncable';
import { TaskSelectionUnit } from './tasks';

export interface TimeEntry {
    id?: string,
    description?: string,
    TSU?: string,
    start: number,
    end?: number,
    archived?: boolean
    //customFields: []
}

export enum TimeEntryComponentTypes {
    ACTIVE = 'ACTIVE',
    TASK_GROUP = 'TASK_GROUP',
    TIME_SLICE = 'TIME_SLICE'
}

export interface TEDataSliceInt extends DataSyncable<TimeEntry> {
    data?: TimeEntry,
}

export interface LTESliceInt extends DataSyncable<TEDataSliceInt[]> {
    data: TEDataSliceInt[];
}


export type TeCtrlTypes = 'prefix' | 'tsu' | 'dscr' | 'start' | 'end' | 'duration' | 'playBtn' | 'duplicateBtn' | 'cancelBtn';

export enum CtrlUiStatus {
    OFF = 'OFF', //!on
    CTRL_DISABLED = 'CTRL_DISABLED', //on && alwaysAsControl and !editable 
    STATIC_NONEDITABLE = 'STATIC_NONEDITABLE', // on && !alwaysAsControl && !editable  
    STATIC_EDITABLE = 'STATIC_EDITABLE', // on && !alwaysAsControl && editable && !editing
    CTRL_ENABLED = 'CTRL_ENABLED', // (on && !alwaysAsControl && editable && editing) || (on && alwaysAsControl && editable)
}

export interface PrefixCtrlCfg {
    status: CtrlUiStatus;
    textValue: string;
    prefixClickHandler?: Function;
}

export interface TsuCtrlCfg {
    status: CtrlUiStatus;
    tsuId: string;
    tsuTaskSelectionList?: TaskSelectionUnit[];
    tsuOptions: string[];
    tsuGetOptionLabel: (option: string) => string;
    tsuInputValue: string;
    // tsuToggleCtrlHandler: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface DscrCtrlCfg {
    status: CtrlUiStatus;
    currentValue: string;
}

export interface DscrCtrlCfg {
    status: CtrlUiStatus;
    currentValue: string;
}

export interface StartDateCtrl {
    status: CtrlUiStatus;
    sliceStartDate: Date;
    sliceStartMS: number;
    maxDate: Date;
}

export interface EndDateCtrl {
    status: CtrlUiStatus;
    sliceEndDate: Date;
    sliceEndMS: number;
    minDate: Date;
}

export interface TeLfCfg {
    prefix: PrefixCtrlCfg;
    tsu: TsuCtrlCfg;
    dscr: DscrCtrlCfg;
    start: StartDateCtrl;
    end: EndDateCtrl;
}

export type TeLfCtrlKeysWithLocalState = keyof TeLfCfg;

export type TeLfCtrlsWithLocalState = TeLfCfg[TeLfCtrlKeysWithLocalState];

export type TeLfEntityType = 'teTimeSlice' | 'teTaskGroup' | 'teTimeGroup';
//if year timeGroup - last month time group will have a timeGroupType
export interface TeLfEntityInfoBase {
    teLfEntityType: TeLfEntityType;
    timeSlicingType?: TimeSliceTypes; 
    tesStateMapId: string; //essentially react key and used to decide to preserve editing state
    sliceStartMS: number; //it is not modified by ctrl and changed via redux only
    sliceEndMS: number; //it is not modified by ctrl and changed via redux only
    durationMS: number;
}

export interface TeLfEntityInfoTimeSlice extends TeLfEntityInfoBase {
    teLfEntityType: 'teTimeSlice';
    timeSliceCount: number;
    timeSliceNumber: number;
    teIsMultiSlice: boolean;
    teId: string;
    // teRefIdx: number;
    tsuId?: string; //it is not modified by ctrl and changed via redux only
    tsuInputValue: string; //it is not modified by ctrl and changed via redux only
    dscr: string; //it is not modified by ctrl and changed via redux only
    startsInPast: boolean; //baseEntity start date is earlier than slice start
    endsInFuture: boolean; //baseEntity end date is earlier than slice start
    teStartMS: number;
    teEndMS: number;
    startDateGroupObj: DateGroupObjFull;
}

export interface TeLfEntityInfoTaskGroup extends TeLfEntityInfoBase {
    teLfEntityType: 'teTaskGroup';
    tecsIds: Set<string>;
    tsuId: string; //it is not modified by ctrl and changed via redux only
    tsuInputValue: string; //it is not modified by ctrl and changed via redux only
}

export interface TeLfEntityInfoTimeGroup extends TeLfEntityInfoBase {
    teLfEntityType: 'teTimeGroup';
    teLFTimeGroupType: TimeSliceTypes;
    timeSpanStartMS: number;
}

export type TeLfEntityInfo = TeLfEntityInfoTimeSlice | TeLfEntityInfoTaskGroup | TeLfEntityInfoTimeGroup;

export interface TeLfData {
    teLfCfg: TeLfCfg;
    entityInfo: TeLfEntityInfo;
    fetchStatus: FetchStatus;
}

interface TecsStateMapIdCfgTimeSlice {
    teLfEntityType: 'teTimeSlice';
    teId: string;
    timeSliceNumber: number;
    timeSlicingString: string;
  }
  
  interface TecsStateMapIdCfgTaskGroup {
    teLfEntityType: 'teTaskGroup';
    tsuId: string;
    parentTimeGroupMapId?: string;
  }
  
  interface TecsStateMapIdCfgTimeGroup {
    teLfEntityType: 'teTimeGroup';
    teLFTimeGroupType: TimeSliceTypes;
    dateGroupObj: DateGroupObjFull;
    timeSlicingString: string;
  }
  
export type TecsStateMapIdCfg = TecsStateMapIdCfgTimeSlice | TecsStateMapIdCfgTaskGroup | TecsStateMapIdCfgTimeGroup;

