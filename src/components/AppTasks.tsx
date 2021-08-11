import { cloneElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Theme } from '@material-ui/core';

import { Task } from '../interfaces/tasks';
// import {ReactComponent as TimeKeeperIcon} from '../assets/time-keeper-icon.svg';
import { selectTfm } from '../redux/tfmSlice';

const useStyles = makeStyles((theme: Theme) => {
    const padding = `${theme.spacing(1)}px`;
    return createStyles({
        wrapperLevel0: {
            marginBlock: padding,
            paddingInlineStart: padding,
            border: `1px solid ${theme.palette.primary.main}` 
        },
        wrapperLevel1: {
            marginInlineStart: theme.spacing(1) * 2,
        },
        wrapperLevel2: {
            marginInlineStart: theme.spacing(1) * 3,
        },
        wrapperLevel3: {
            
        },
        elmLevel0: {
            fontSize: '1.2rem',
        },
        elmLevel1: {
            fontSize: '1rem',
        },
        elmLevel2: {
            fontSize: '0.875rem',
        },
        elmLevel3: {
            fontSize: '0.7rem',
        },
    })
  })

export default function AppTasks() {
    const classes = useStyles();

    const wrappersDict = [
        [<div className={clsx(classes.wrapperLevel0)}></div>, <div className={clsx(classes.elmLevel0)}></div>],
        [<div className={clsx(classes.wrapperLevel1)}></div>, <div className={clsx(classes.elmLevel1)}></div>],
        [<div className={clsx(classes.wrapperLevel2)}></div>, <div className={clsx(classes.elmLevel2)}></div>],
        [<div className={clsx(classes.wrapperLevel3)}></div>, <div className={clsx(classes.elmLevel3)}></div>],
    ]

    const tfmData = useSelector(selectTfm);

    const tasksBlock = useMemo<JSX.Element[] | null>(() => {
        if (!tfmData) {
            return null;
        }
        const buildHierList = (id: string, childrenOfParentWrapper: JSX.Element[]) => {
            const currItem = tfmData[id];
            const childrenOfCurrentWrapper: JSX.Element[] = [];
            const currentWrapper = cloneElement(wrappersDict[currItem.level][0], {key: `wrapper_${id}`}, childrenOfCurrentWrapper);
            childrenOfParentWrapper.push(currentWrapper);
            const currentElm = cloneElement(wrappersDict[currItem.level][1], {key: `elm_${id}`}, [currItem.name]);
            childrenOfCurrentWrapper.push(currentElm);
            if (tfmData[id].children?.length) {
                //tfmData[id].children.sort(...);
                tfmData[id].children!.forEach(childId => {
                    buildHierList(childId, childrenOfCurrentWrapper);
                })
            } else {
                return;
            }
        }
        const topLevelList: Task[] = []//array because it may be sorted later by some field
        Object.entries(tfmData).forEach(([id, taskObj]) => {
            if (!taskObj.level) {
                topLevelList.push({
                    id,
                    ...taskObj
                } as Task)
            }
        })
        // topLevelList.sort(...)
        const list: JSX.Element[] = [];

        topLevelList.forEach(({id}) => {
            buildHierList(id, list);
        })
        return list;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tfmData])


    return (
        <div>
            <div className={clsx(classes.elmLevel0)}>Static hierarchical list of tasks (non-editable in demo)</div>
            {
                tasksBlock
            }

            {/* <TimeKeeperIcon height={100} width={100} fill="orange"/> */}
        </div>
    )
}