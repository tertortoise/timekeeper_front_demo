import { FC } from 'react';
import clsx from 'clsx';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { LinearProgress, Theme } from '@material-ui/core';

interface ProgressBarWrapperProps {
  hidden: boolean,
  height?: number,
}
interface CustomStyleProps {
  height?: number
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    height: ({height}: CustomStyleProps) => height ?? 4,
  },
  hide: {
    visibility: 'hidden'
  }
}))

const ProgressBarWrapper: FC<ProgressBarWrapperProps> = ({ hidden, height }) => {
  const classes = useStyles({height});
  return (<>
    { hidden ?
      <div className={clsx(classes.root)}></div> :
       <LinearProgress
      classes={{
        root: classes.root,
      }}
      // className={clsx({ [classes.hide]: hidden })}
    />
    }
    </>
  )
}

export default ProgressBarWrapper;