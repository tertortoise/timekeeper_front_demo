import { useState, memo, useMemo, MouseEvent, Children, ReactNode } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Menu, MenuItem, Fade, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    buttonStyles: {
      background: 'initial',
      border: 'initial',
      borderRadius: '50%',
      paddingInline: 0,
      cursor: 'pointer',
      '&:hover': {
        background: 'rgba(102, 86, 209, 0.1)'
      }
    },
  })
})

interface MenuButtonProps {
  disabled?: boolean;
  children: ReactNode
}

const MenuButton = ({disabled, children }: MenuButtonProps): JSX.Element => {

  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    console.log('close handler')
    setAnchorEl(null);
  };
  const content = useMemo(() => {
    if (disabled) {
      return <div> <MoreVertIcon color="disabled" /></div>
    } else {
      return (<>
        <button 
          className={clsx(classes.buttonStyles)}
          onClick={handleClick}
        >
          <MoreVertIcon color="primary" />
        </button>
        {open && <Menu
          id="fade-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
        >
          {Children.map(children, (child) => {
            return <MenuItem onClick={handleClose}>{child}</MenuItem>
          })}
        </Menu>}
      </>)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, open, children])


  return content;
}

export default memo(MenuButton);