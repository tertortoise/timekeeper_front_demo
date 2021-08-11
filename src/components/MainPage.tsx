import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route, Redirect } from 'react-router-dom';
import clsx from 'clsx';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Drawer, Hidden, AppBar, Toolbar, CssBaseline, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import SettingsIcon from '@material-ui/icons/Settings';
import AvTimerIcon from '@material-ui/icons/AvTimer';
import InfoIcon from '@material-ui/icons/Info';

import MainPageMenu, { MenuItemsDict } from "./MainPageMenu";
import TimeEntryActive from "./Tracker/TimeEntryActive";
import { fetchTimeEntryActiveSaga } from '../redux/timeEntryActiveSaga';
import {readTfmSaga} from '../redux/tfmSaga';
import { LDR_LTE_Saga } from '../redux/LTESaga';
import AppTracker from "./Tracker/AppTracker";
import AppTasks from "./AppTasks";
import AppInfo from "./AppInfo";
import InfoSnackbars from './InfoSnackbars/InfoSnackBarsComponent';
import { selectRusultInitialSyncStatusForDiffSlices } from '../redux/initialSyncSlice';
import { RootState } from '../interfaces/redux';

const drawerWidth = 240;

//key is section
const menuItemsDict: MenuItemsDict = {
  trackerSection: [
    { localKey: 'tracker', route: '/tracker', icon: AvTimerIcon, homeSection: true },
  ],
  settingsSection: [
    { localKey: 'tasks', route: '/tasks', icon: SettingsIcon }
  ],
  aboutSection: [
    { localKey: 'about', route: '/about', icon: InfoIcon }
  ],
}

const useStyles = makeStyles((theme) => {
  return ({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      [theme.breakpoints.up('sm')]: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }
    },
    menuButton: {
      width: 57,
      // marginInlineEnd: 12,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
    drawerPaper: {
      width: drawerWidth,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      [theme.breakpoints.down('sm')]: {
        height: 150,
      },
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },
    toolbarGutters: {
      '&.MuiToolbar-gutters': {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
      }
    },
    containerTEA: {
      backgroundColor: 'rgba(102, 86, 209, 0.5)',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(1),
      width: '100%'
    },
  })
});

export default function MainPage() {

  //#region constants and state
  const dispatch = useDispatch();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sectionsToRenderInMenu] = useState(['trackerSection', 'settingsSection', 'aboutSection']);

  const theme = useTheme();

  const showTEA = useSelector((state: RootState) => selectRusultInitialSyncStatusForDiffSlices(state, ['TEA', 'TFM']))

  //#endregion

  //#region useEffects
  useEffect(() => {
    dispatch({ type: fetchTimeEntryActiveSaga });
    dispatch({ type: readTfmSaga });
    dispatch({ type: LDR_LTE_Saga });
  }, [dispatch])

  //#endregion

  //#region handlers
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  //#endregion

  // TEMP


  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar className={classes.toolbarGutters}>
            <Hidden smUp implementation="css">
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                edge="start"
                className={clsx(classes.menuButton)}
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Hidden xsDown implementation="css">
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                className={clsx(classes.menuButton, {
                  [classes.hide]: open,
                })}
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            {showTEA && <TimeEntryActive />}
          </Toolbar>
        </AppBar>
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <div className={classes.toolbar}>
              <IconButton onClick={handleDrawerToggle}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </div>
            <MainPageMenu
              mainMenuDict={menuItemsDict}
              sectionsToRender={sectionsToRenderInMenu}
            ></MainPageMenu>
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}
          >
            <div className={classes.toolbar}>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </div>
            <MainPageMenu
              mainMenuDict={menuItemsDict}
              sectionsToRender={sectionsToRenderInMenu}
            ></MainPageMenu>
          </Drawer>
        </Hidden>

        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route path="/tracker" component={AppTracker} />
            <Route path="/tasks" component={AppTasks} />
            <Route path="/about" component={AppInfo} />
            <Route path="/"><Redirect to="/tracker" /></Route>
          </Switch>

        </main>
        <InfoSnackbars />
      </div>
    </MuiPickersUtilsProvider>

  );
}